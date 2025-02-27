const chalk = require('chalk');

const Logger = (message,type) => {
    
    switch (type) {
        case 'dev':
            console.log(chalk.cyan(`[D] ${message}`));
            break;

        case 'warn':
            console.log(chalk.yellow(`[!] ${message}`));
            break;
        
        case 'help':
            console.log(chalk.blue(`[?] ${message}`));
            break;

        case 'success':
            console.log(chalk.blue(`[☑] ${message}`));
            break;
        default:
            console.log(message)
            break;
    }
}

module.exports = {Logger}