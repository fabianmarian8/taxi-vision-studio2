#!/usr/bin/env node
/**
 * Konvertuje mailing list CSV na formát pre Google Sheets + Apps Script
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '..', 'data', 'obce-mailing-list-2500.csv');
const outputFile = path.join(__dirname, '..', 'data', 'obce-google-sheets.csv');

const content = fs.readFileSync(inputFile, 'utf8');
const lines = content.trim().split('\n');

// Nový header - premenovať email na Recipient, pridať Email Sent
const newHeader = 'Recipient,nazov_obce,url_obce,Email Sent';

// Spracuj riadky - pridaj prázdny stĺpec na koniec
const newLines = [newHeader];
for (let i = 1; i < lines.length; i++) {
  newLines.push(lines[i] + ',');
}

fs.writeFileSync(outputFile, newLines.join('\n'), 'utf8');

console.log('Vytvorený súbor:', outputFile);
console.log('Počet kontaktov:', newLines.length - 1);
console.log('');
console.log('Prvých 5 riadkov:');
newLines.slice(0, 6).forEach(line => console.log(line));
