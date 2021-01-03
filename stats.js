const prettyMS = require("pretty-ms");
const percentile = require("stats-percentile");
const { table } = require("table");

module.exports.generateStats = (endpoints) => {
  let start;
  try {
    //Params
    start = new Date();
    const totalReqs = endpoints.length;
    const totalSuccessReqs = endpoints.filter((item) => item.isSuccessful)
      .length;
    const totalFailedReqs = totalReqs - totalSuccessReqs;

    const sumTime = endpoints.reduce((accumulator, current) => {
      return accumulator + current.time;
    }, 0);
    const avgTime = sumTime / totalReqs;
    const p95 = percentile(
      endpoints.map((item) => item.time),
      95
    );
    const p99 = percentile(
      endpoints.map((item) => item.time),
      99
    );

    output = table([
      [
        "total reqs",
        "total success reqs",
        "total failed reqs",
        "SUM ms",
        "AVG ms",
        "SUM human",
        "AVG human",
        "P95 human",
        "P99 human",
      ],
      [
        totalReqs,
        totalSuccessReqs,
        totalFailedReqs,
        sumTime.toFixed(3),
        avgTime.toFixed(3),
        prettyMS(sumTime),
        prettyMS(avgTime),
        prettyMS(p95),
        prettyMS(p99),
      ],
    ]);
    return [
      `
    ============================================
    Report generation time : ${prettyMS((new Date() - start) / 1000)}
    ============================================
    `,
      output,
    ];
  } catch (error) {
    console.log(error);
    return null;
  }
};
