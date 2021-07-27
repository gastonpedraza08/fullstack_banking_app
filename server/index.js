require('dotenv').config();
const express = require('express');
const authRoute = require('./routes/auth');
const profileRoute = require('./routes/profile');
const accountRoute = require('./routes/account');
const transactionsRoute = require('./routes/transactions');
const cors = require('cors');
const config = require('./config/config');
const { sequelize } = require('./models');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded());
app.set('view engine', 'ejs');
app.use(cors());
app.use(authRoute);
app.use(profileRoute);
app.use(accountRoute.Router);
app.use(transactionsRoute);

app.listen(PORT, () => {
	console.log(`server started on port ${PORT}`);
	try {
		sequelize.authenticate();
		console.log('Connection has been established successfully.');
	} catch (error) {
		console.error('Unable to connect to the database:', error);
	}
});