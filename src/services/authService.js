const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Service function to handle user login
async function authenticateUser(username, password) {
    const query = `
        SELECT u.*, s."Student_No", st."Staff_Number" FROM "USER" u
        LEFT JOIN "STUDENT" s ON u."User_ID" = s."User_ID"
        LEFT JOIN "STAFF" st ON u."User_ID" = st."User_ID"
        WHERE u."U_Email" = $1 OR s."Student_No" = $1 OR st."Staff_Number" = $1
    `;
    const result = await pool.query(query, [username]);

    if (result.rows.length === 0) {
        throw new Error('Invalid username or password');
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.U_Pword_Hash);

    if (!isPasswordValid) {
        throw new Error('Invalid username or password');
    }

    const payload = { 
        userId: user.User_ID, 
        email: user.U_Email, 
        isStudent: user.User_Is_Student, 
        isStaff: user.User_Is_Staff 
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    return {
        token,
        user: {
            id: user.User_ID,
            email: user.U_Email,
            firstName: user.U_FName,
            lastName: user.U_LName,
            studentNumber: user.Student_No || null,
            staffNumber: user.Staff_Number || null
        }
    };
}

// Service function to handle user registration matching your exact database schema
async function registerUser(userData) {
    const { firstName, lastName, phone, email, isStudent, isStaff, studentOrStaffNumber, password } = userData;

    // 1. Check if email already exists
    const existingUser = await pool.query('SELECT * FROM "USER" WHERE "U_Email" = $1', [email]);
    if (existingUser.rows.length > 0) {
        throw new Error('Email already in use');
    }

    // 2. Hash the password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insert into USER table using exact column names from schema
    const insertUserQuery = `
        INSERT INTO "USER" ("U_Email", "U_Pword_Hash", "U_FName", "U_LName", "U_Phone_Num", "User_Is_Student", "User_Is_Staff")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
    `;
    
    const userResult = await pool.query(insertUserQuery, [
        email, 
        hashedPassword, 
        firstName, 
        lastName, 
        phone || null, 
        !!isStudent, 
        !!isStaff
    ]);

    const newUser = userResult.rows[0];
    const newUserId = newUser.User_ID;

    // 4. Insert into Student or Staff table using exact column names (`Student_No`)
    if (isStudent && studentOrStaffNumber) {
        await pool.query(
            'INSERT INTO "STUDENT" ("User_ID", "Student_No") VALUES ($1, $2)',
            [newUserId, studentOrStaffNumber]
        );
    } else if (isStaff && studentOrStaffNumber) {
        await pool.query(
            'INSERT INTO "STAFF" ("User_ID", "Staff_Number") VALUES ($1, $2)',
            [newUserId, studentOrStaffNumber]
        );
    }

    return {
        id: newUserId,
        email: newUser.U_Email,
        firstName: newUser.U_FName,
        lastName: newUser.U_LName
    };
}

module.exports = {
    authenticateUser,
    registerUser
};