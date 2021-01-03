const stopwatch = require("statman-stopwatch");
const { logger, buildRequest } = require("./utils");
const core = require("@actions/core");
const file = require("fs");
const stats = require('./stats')

const Main = async () => {
  const log = logger({ printFile: false });

  const fileName = core.getInput("config-file") || "./configs/test.json";

  //look for a valid config file
  if (
    !fileName ||
    !file.existsSync(fileName) ||
    fileName.substr(fileName.length - 4, 4) === ".json"
  )
    throw new Error("Invalid Config file");
  const configFile = require(fileName);

  const { basepath, endpoints = [] } = configFile;

  const summary_execution = {
    basepath: configFile.basepath,
    startedAt: +new Date(),
    endpoints: [],
  };
  for (const endpoint of endpoints) {
    let result;
    try {
      result = await buildRequest(basepath, endpoint);
      result = {
        isSuccessful: true,
        time: result.timings.end - result.timings.start,
        endpoint: endpoint.path,
        data: {
          url: result.url,
          method: result.method,
          statusCode: result.statusCode,
          statusMessage: result.statusMessage,
          timings: result.timings,
        },
      };
    } catch (error) {
        core.setFailed(error.message);
        result = {
          isSuccessful: false,
          time: 0,
          data: {
            message: error.message,
            stack: error.stack,
            headers: error.headers,
            url: error.url,
            method: error.method,
            statusCode: error.statusCode,
            statusMessage: error.statusMessage,
            name: error.name,
            code: error.code,
            timings: error.timings,
            event: error.event,
          },
        };
    }
    summary_execution.endpoints.push(result)
  }
  summary_execution.endedAt =  +(new Date())
  core.setOutput("summary", JSON.stringify(summary_execution));

  //generate stats 
  const prettyStats = stats.generateStats(summary_execution.endpoints)

  if(!prettyStats) return console.error(`
    ==> cannot be generated the pretty stats, instead, the raw data will be print.
    ${JSON.stringify(summary_execution)}
  `)

  console.info(prettyStats.join("\n"))
};

Main();
