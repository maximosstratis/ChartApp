var mysql = require('mysql');
var sleep = require('system-sleep');

var con = mysql.createConnection({
    host: "***",
    user: "***",
    password: "***",
    database: "***"
});

const http = require('http');
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.static(__dirname));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/tableNames', (req, res) => {
    var tableNames = "";
    con.query("SELECT table_name FROM information_schema.tables WHERE table_schema ='chartapp';", function (err, tables) {
        for (table of tables) {
            tableNames += ";" + table.TABLE_NAME;
        }
        res.json({
            message: tableNames + ";"
        });
    });
});

app.get('/years', (req, res) => {
    con.query("SELECT * FROM years;", function (err, years) {
        var yearsText = "";
        for (year of years) {
            yearsText += ";" + year.year_id + "," + year.year_value;
        }
        res.json({
            message: yearsText + ";"
        });
    });
});

app.get('/countries', (req, res) => {
    con.query("SELECT * FROM countries;", function (err, countries) {
        var countriesText = "";
        for (country of countries) {
            countriesText += ";" + country.country_id + "+" + country.country_name;
        }
        res.json({
            message: countriesText + ";"
        });
    });
});

app.get('/data', (req, res) => {

    con.query("SELECT * FROM " + req.query.table + " WHERE country_id = " + req.query.country, function (err, data) {
        var resultText = "";
        for (result of data) {
            resultText += ";" + result.value + "," + result.year_id;
        }
        res.json({
            message: resultText + ";"
        });
    });
});

app.listen(8080, () => {
    console.log('server is listening on port 8080');
});
