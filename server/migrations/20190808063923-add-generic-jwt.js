module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('teams', 'genericJwtId', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true
    });
    await queryInterface.addIndex('teams', ['genericJwtId']);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('teams', 'genericJwtId');
    await queryInterface.removeIndex('teams', ['genericJwtId']);
  }
}