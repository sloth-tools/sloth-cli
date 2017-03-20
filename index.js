const vorpal = require('vorpal')()
const inquirer = require('inquirer')
const fs = require('fs-extra')
const yaml = require('js-yaml')

vorpal
  .command('init', 'Initializes the process of packages selection')
  .action((args, cb) => {
    // Role selection from command line
    roleList = inquirer.prompt([
      {
        type: 'list',
        message: 'Select your role:',
        name: 'role',
        choices: [
          'Developer',
          'Designer'
        ],
        filter: val => val.toLowerCase()
      }
    ], (result) => {
      // Load json files
      let role = result.role
      const base = fs.readJsonSync('./roles/base.json')
      const common = fs.readJsonSync('./roles/common.json')
      const roleList = fs.readJsonSync(`./roles/${role}.json`)

      // Generate system packages
      let systemList = roleList.system.concat(base.system)
      systemList = systemList.map(item => ({ checked: true, name: item, type: 'system' }))
      systemList.unshift(new inquirer.Separator(' = System packages = '))

      // Generate cask packages
      let caskList = roleList.cask.concat(base.cask)
      caskList = caskList.map(item => ({ checked: true, name: item, type: 'cask' }))
      caskList.unshift(new inquirer.Separator(' = Applications = '))

      // Complete package list to show to the user
      const packagesList = (role == 'designer') ? caskList : caskList.concat(systemList)

      // Package selection from command line
      SoftwareList = inquirer.prompt([
        {
          type: 'checkbox',
          message: `As a ${role} we think this software could be useful for you, after the selection press <Enter> to start the installation:\n`,
          name: 'software',
          choices: packagesList
        }
      ], (result) => {
        // Remove deselected packages
        let userSystemList = systemList.filter(item => result.software.includes(item.name))
        let userCaskList = caskList.filter(item => result.software.includes(item.name))

        // Generate install.yml file
        let tasks = common[0].tasks
        tasks[0].homebrew.name = userSystemList.map(item => item.name)
        tasks[2].homebrew_cask.name = userCaskList.map(item => item.name)
        fs.writeFile('./install.yml', yaml.dump(common))
      })
    })
  })

vorpal
  .delimiter('sloth$')
  .show()
  .parse(process.argv)
