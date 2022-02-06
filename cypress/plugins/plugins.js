const fs = require("fs");

module.exports = (on, config) => {
  on('task', {
    writeFile({ path, data, index }) {
      // console.log(data[0]["results"][k]["link"])
      fs.writeFileSync(path, JSON.stringify(data, null, 2), "utf8", (err)=>{if (err) {console.log(err)}});
      return null;
    },
  })
}