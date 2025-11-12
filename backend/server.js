const express = require('express');
const app = express();
const port = 5000;
const cors = require('cors');
app.use(cors());

require('./db'); // connect to the db
app.use('/api/students', require('./routes/students'));

app.listen(port, () => {
    console.log('server running on https://localhost:${port}');
});