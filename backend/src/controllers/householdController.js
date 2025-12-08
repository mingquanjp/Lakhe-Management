const pool = require('../config/database');

// Get all households
const getAllHouseholds = async (req, res) => {
    try {
        const query = `
            SELECT 
                h.household_id as id,
                h.household_code as code,
                h.address,
                h.date_created,
                h.status,
                (r.first_name || ' ' || r.last_name) as owner,
                (SELECT COUNT(*) FROM residents WHERE household_id = h.household_id AND status = 'Permanent') as members
            FROM households h
            LEFT JOIN residents r ON h.head_of_household_id = r.resident_id
            ORDER BY h.household_id DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error getting households:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get household by ID
const getHouseholdById = async (req, res) => {
    const { id } = req.params;
    try {
        const householdQuery = `
            SELECT 
                h.*,
                (r.first_name || ' ' || r.last_name) as owner_name
            FROM households h
            LEFT JOIN residents r ON h.head_of_household_id = r.resident_id
            WHERE h.household_id = $1
        `;
        const householdResult = await pool.query(householdQuery, [id]);

        if (householdResult.rows.length === 0) {
            return res.status(404).json({ message: 'Household not found' });
        }

        const residentsQuery = `
            SELECT * FROM residents 
            WHERE household_id = $1 
            ORDER BY resident_id ASC
        `;
        const residentsResult = await pool.query(residentsQuery, [id]);

        res.json({
            household: householdResult.rows[0],
            residents: residentsResult.rows
        });
    } catch (error) {
        console.error('Error getting household details:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create new household
const createHousehold = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { householdCount, address, members } = req.body;
        // householdCount maps to household_code

        // 1. Create Household
        const householdQuery = `
            INSERT INTO households (household_code, address)
            VALUES ($1, $2)
            RETURNING household_id
        `;
        const householdResult = await client.query(householdQuery, [householdCount, address]);
        const householdId = householdResult.rows[0].household_id;

        let headOfHouseholdId = null;

        // 2. Create Residents
        for (const member of members) {
            // Split name into first and last name
            const nameParts = member.name.trim().split(' ');
            const lastName = nameParts.pop();
            const firstName = nameParts.join(' ');

            const residentQuery = `
                INSERT INTO residents (
                    household_id, 
                    first_name, 
                    last_name, 
                    dob, 
                    occupation, 
                    relationship_to_head,
                    gender,
                    status
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, 'Permanent')
                RETURNING resident_id
            `;
            
            // Default gender to Male if not provided (since UI doesn't have gender input yet)
            // Or we should add gender to UI. For now, let's default or guess.
            // Ideally UI should provide it. I'll default to 'Male' for now to avoid constraint error.
            const gender = member.gender || 'Male'; 

            const residentResult = await client.query(residentQuery, [
                householdId,
                firstName,
                lastName,
                member.dob,
                member.occupation,
                member.relation,
                gender
            ]);

            if (member.relation === 'Chủ hộ') {
                headOfHouseholdId = residentResult.rows[0].resident_id;
            }
        }

        // 3. Update Head of Household
        if (headOfHouseholdId) {
            await client.query(
                'UPDATE households SET head_of_household_id = $1 WHERE household_id = $2',
                [headOfHouseholdId, householdId]
            );
        }

        await client.query('COMMIT');
        res.status(201).json({ message: 'Household created successfully', householdId });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating household:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    } finally {
        client.release();
    }
};

// Split household
const splitHousehold = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { originalHouseholdId, newHouseholdCode, newAddress, newOwnerId, memberIds } = req.body;

        // 1. Create New Household
        const householdQuery = `
            INSERT INTO households (household_code, address, head_of_household_id)
            VALUES ($1, $2, $3)
            RETURNING household_id
        `;
        const householdResult = await client.query(householdQuery, [newHouseholdCode, newAddress, newOwnerId]);
        const newHouseholdId = householdResult.rows[0].household_id;

        // 2. Update Residents
        // Move selected members to new household
        const updateResidentsQuery = `
            UPDATE residents 
            SET household_id = $1 
            WHERE resident_id = ANY($2::int[])
        `;
        await client.query(updateResidentsQuery, [newHouseholdId, memberIds]);

        // 3. Update relationships
        // The new owner is already set as head of household in step 1.
        // We need to update their relationship_to_head to 'Chủ hộ'
        await client.query(
            "UPDATE residents SET relationship_to_head = 'Chủ hộ' WHERE resident_id = $1",
            [newOwnerId]
        );

        // For other members, we might need to reset their relationship or ask user to update it.
        // For simplicity now, we set them to 'Thành viên' or keep as is (which might be wrong relative to new head).
        // Ideally, we should ask for new relationships.
        // I'll set others to 'Thành viên' for now.
        await client.query(
            "UPDATE residents SET relationship_to_head = 'Thành viên' WHERE household_id = $1 AND resident_id != $2",
            [newHouseholdId, newOwnerId]
        );

        await client.query('COMMIT');
        res.json({ message: 'Household split successfully', newHouseholdId });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error splitting household:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    } finally {
        client.release();
    }
};

module.exports = {
    getAllHouseholds,
    getHouseholdById,
    createHousehold,
    splitHousehold
};
