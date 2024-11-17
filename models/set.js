const DataTypes = require('sequelize');
const sequelize = require('../sequelizeInstance');
const Theme = require('./theme');

const Set = sequelize.define('Set', {
    set_num: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
    },
    year: {
        type: DataTypes.INTEGER,
    },
    num_parts: {
        type: DataTypes.INTEGER,
    },
    theme_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Theme,
            key: 'id',
        },
    },
    img_url: {
        type: DataTypes.STRING,
    },
}, {
    createdAt: false,
    updatedAt: false,
});

Set.belongsTo(Theme, { foreignKey: 'theme_id' });

module.exports = Set;
