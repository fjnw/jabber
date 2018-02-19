User = require('./accounts');
module.exports = function(sequelize, DataTypes) {
    var Messages = sequelize.define("Messages", {
        /* Message Posted */
        message: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        /* Message Image - optional */
        image: {
        	type: DataTypes.STRING,
        	allowNull: true
        }
        /* id, and time stamp of message auto-created by Sequelize: createdAt && updatedAt */
    });
  return Messages;
};

