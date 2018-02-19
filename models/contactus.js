module.exports = function(sequelize, DataTypes) {
    var Contact = sequelize.define("Contact", {

        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 25]
            }
        },

        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 25],
                isEmail : true
            }
        },

        message: {
            type: DataTypes.TEXT,
            allowNull: true
        },
  });

  return Contact;
};
