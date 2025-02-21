const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// خواندن فایل JSON اساتید
let professorsData;
try {
    professorsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'final.json'), 'utf-8'));
} catch (error) {
    console.error('Error reading professors.json:', error);
    process.exit(1); // اگر فایل خوانده نشود، سرور متوقف می‌شود
}

// API برای دریافت لیست اساتید
app.get('/api/professors', (req, res) => {
    try {
        const professorsList = Object.keys(professorsData).map(name => ({
            FirstName: professorsData[name].FirstName,
            LastName: professorsData[name].LastName,
            Department: professorsData[name].Department,
            ProfessorID: professorsData[name].ProfessorID,
            Profile: professorsData[name].Profile,
        })).filter((prof => prof.FirstName.trim() !== "" || prof.LastName.trim() !== ""));
        res.json(professorsList);
    } catch (error) {
        res.status(500).json({message: 'Internal server error'});
    }
});

// API برای دریافت اطلاعات یک استاد خاص
app.get('/api/professors/:id', (req, res) => {
    try {
        const professorId = req.params.id;
        const professor = Object.values(professorsData).find(prof => prof.ProfessorID === professorId);
        if (professor) {
            res.json(professor);
        } else {
            res.status(404).json({message: 'Professor not found'});
        }
    } catch (error) {
        res.status(500).json({message: 'Internal server error'});
    }
});

/*
// API برای جستجو بر اساس نام استاد یا موضوع
app.get('/api/search', (req, res) => {
    try {
        const {query} = req.query;
        if (!query) {
            return res.status(400).json({message: 'Query parameter is required'});
        }

        const normalizedQuery = query.toLowerCase(); // جستجوی حساس نباشد
        const results = Object.values(professorsData).filter(prof => {
            const nameMatch = prof.FirstName.toLowerCase().includes(normalizedQuery) ||
                prof.LastName.toLowerCase().includes(normalizedQuery);
            const bookMatch = prof.Books.some(book => book.Title.toLowerCase().includes(normalizedQuery));
            const paperMatch = prof.Papers.some(paper => paper.Paper_Title.toLowerCase().includes(normalizedQuery));
            return nameMatch || bookMatch || paperMatch;
        });

        res.json(results);
    } catch (error) {
        res.status(500).json({message: 'Internal server error'});
    }
});
*/

app.get('/api/professors/by-interest', (req, res) => {
    try {
        const {interest} = req.query;
        if (!interest) {
            return res.status(400).json({message: 'Interest parameter is required'});
        }

        const normalizedInterest = interest.toLowerCase();
        const results = Object.values(professorsData).filter(prof =>
            prof.Interests.some(i => i.toLowerCase().includes(normalizedInterest))
        );

        res.json(results);
    } catch (error) {
        res.status(500).json({message: 'Internal server error'});
    }
});

app.get('/api/search', (req, res) => {
    const {query, type} = req.query;

    if (!query || !type) {
        return res.status(400).json({message: 'Query and type parameters are required'});
    }

    const normalizedQuery = query.toLowerCase();
    let results = [];

    if (type === 'Professors') {
        results = Object.values(professorsData).filter(prof =>
            prof.FirstName.toLowerCase().includes(normalizedQuery) || prof.LastName.toLowerCase().includes(normalizedQuery)
        );
    } else if (type === 'Books') {
        results = Object.values(professorsData).filter(prof =>
            prof.Books.some(book => book.Title.toLowerCase().includes(normalizedQuery))
        );
    } else if (type === 'Papers') {
        results = Object.values(professorsData).filter(prof =>
            prof.Papers.some(paper => paper.Paper_Title.toLowerCase().includes(normalizedQuery))
        );
    }

    res.json(results);
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});