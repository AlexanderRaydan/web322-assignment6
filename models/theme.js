const DataTypes = require('sequelize');
const sequelize = require('../sequelizeInstance');

const Theme = sequelize.define('Theme', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
    },
}, {
    createdAt: false,
    updatedAt: false,
});

module.exports = Theme;
