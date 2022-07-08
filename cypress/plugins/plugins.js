const fs = require("fs");

module.exports = (on, config) => {
  on('task', {
    writeFile({ path, data, index, link }) {
      // data[0].results[index].url = link;
      console.log(data[0].results[index].url)
      fs.writeFileSync(path, JSON.stringify(data, null, 2), "utf8", (err)=>{if (err) {console.log(err); /*cy.task("terminal_log", {err}*/}});
      return null;
    },
    terminal_log({ start }) {
      console.log( start )
      return null;
    },
  })
}