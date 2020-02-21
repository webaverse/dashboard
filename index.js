#!/bin/bash

const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');

const app = express();
app.use(express.static(__dirname));

http.createServer(app)
  .listen(8000);

console.log(`http://127.0.0.1:8000`);
