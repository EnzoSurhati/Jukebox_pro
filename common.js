const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { faker } = require('@faker-js/faker');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports = {express, router, prisma, faker, jwt, bcrypt};