const Controller = require('../models/Controller');
const Action = require('../models/ControllerAction');
const Role = require('../models/Role');

// CREATING REALTIONS HERE
Controller.belongsToMany(Action, {
    through: 'controlleractionmap',
    foreignKey: 'controller_id',
});
Action.belongsToMany(Controller, {
    through: 'controlleractionmap',
    foreignKey: 'action_id',
});

// RBAC ROUTES HERE
exports.fetchControllerAndActions = async (req, res, next) => {
    const controllerCount = await Controller.count();

    let dataList = [];

    const getActionsForController = async (id) => {
        let controller = await Controller.findOne({ where: { id } });
        let actions = await controller.getController_actions();

        return {
            controller,
            actions,
        };
    };

    async function getData() {
        let data;
        for (let i = 1; i <= controllerCount; i++) {
            data = await getActionsForController(i);
            dataList.push(data);
        }

        return await res.status(200).send({
            status: '<success>',
            dataList,
        });
    }

    getData();
};

exports.addRolePermissions = async (req, res, next) => {
    const { user_role, permissions } = req.body;

    let permissionJSON = '{';

    for (let [controller_name, permission] of Object.entries(permissions)) {
        const { id, actions } = permission;
        permissionJSON += `"${id}":[`;
        for (let [key, value] of Object.entries(actions)) {
            permissionJSON += `"${value}",`;
        }
        permissionJSON += `],`;
    }
    permissionJSON += '}';

    const role = await Role.update(
        { role_name: user_role, role_permissions: permissionJSON },
        {
            where: {
                role_name: user_role,
            },
        }
    );
};
