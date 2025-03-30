import chalk from "chalk";
class Logger {
  static dev(message) {
    console.log(chalk.cyan(`[D] ${message}`));
  }
  static warn(message) {
    console.log(chalk.yellow(`[!] ${message}`));
  }
  static error(message) {
    console.log(chalk.red(`[X] ${message}`));
  }
  static help(message) {
    console.log(chalk.blue(`[?] ${message}`));
  }
  static success(message) {
    console.log(chalk.blue(`[☑] ${message}`));
  }
  static info(message) {
    console.log(chalk.white(`[i] ${message}`));
  }
}

// const Logger = (message, type) => {
//   switch (type) {
//     case "dev":
//       console.log(chalk.cyan(`[D] ${message}`));
//       break;

//     case "warn":
//       console.log(chalk.yellow(`[!] ${message}`));
//       break;

//     case "error":
//       console.log(chalk.red(`[X] ${message}`));
//       break;

//     case "help":
//       console.log(chalk.blue(`[?] ${message}`));
//       break;

//     case "success":
//       console.log(chalk.blue(`[☑] ${message}`));
//       break;
//     default:
//       console.log(message);
//       break;
//   }
// };

export default Logger;
