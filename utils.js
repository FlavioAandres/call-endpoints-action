const HttpAgent = require("agentkeepalive");
const util = require('util')
const { default: got } = require("got/dist/source");
const { type } = require("os");
const axios = require('axios')
const HttpsAgent = HttpAgent.HttpsAgent;

module.exports.logger = ({ printFile, pathName }) => {
	let file 
  if (printFile && pathName)
    file = fs.createWriteStream(pathName, { flags: "w" });
  return (...args) => {
		args = args.map(item=>{
			if(typeof item === 'object')
				return JSON.stringify(item)
			return item
		})
    if (printFile) file.write(util.format(args.join(',')) + "\n");
    process.stdout.write(util.format(args.join(',')) + "\n");
  };
};

const streamToString = (stream) => {
  const chunks = [];
  return new Promise((resolve, reject) => {
		if(stream && stream.on && typeof stream.on === 'function'){
			stream.on("data", (chunk) => chunks.push(chunk));
			stream.on("error", reject);
			stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
		}else{
			reject(new Error('No stream found on bodyURL'))
		}
  });
};

const keepAliveAgents = () => {
  const {
    AGENT_REQ_KEEPALIVE = true,
    AGENT_REQ_FREESOCKETTIMEOUT = 15000,
    AGENT_REQ_TIMEOUT = 30000,
    AGENT_REQ_MAXSOCKETS = 30,
    AGENT_REQ_MAXFREESOCKETS = 5,
  } = process.env;

  const config = {
    keepAlive: AGENT_REQ_KEEPALIVE,
    freeSocketTimeout: +AGENT_REQ_FREESOCKETTIMEOUT,
    timeout: +AGENT_REQ_TIMEOUT,
    maxSockets: +AGENT_REQ_MAXSOCKETS,
    maxFreeSockets: +AGENT_REQ_MAXFREESOCKETS,
  };

  const keepAliveHttpAgent = new HttpAgent(config);
  const keepAliveHttpsAgent = new HttpsAgent(config);

  return { keepAliveHttpAgent, keepAliveHttpsAgent };
};

const downloadBodyFile = (url) => axios({
	method: 'get',
	responseType: "stream",
	url: url
})

module.exports.buildRequest = async (basepath, config = {}) => {
  if (!Object.keys(config).length) throw new Error("Invalid Config Object");
	
	const {
    path,
		method,
		timeoutMS = 60000,
    allowKeepAliveAgent,
		headers = {},
		content = {},
    type,
	} = config

	const  {
		urlBody,
		body,
		param
	} = content
	
	const bodyData = {},
	agents = {},
	newHeaders =  {
		...headers, 
		['Content-Type']: type
	}

	const uploadType = type === 'application/x-www-form-urlencoded' ? 'form' : 'json'
	
	//if no urlBody is set, use body params
	if(urlBody){
		const content = await streamToString(
			 (await downloadBodyFile(urlBody)).data
		)
		bodyData[uploadType] = { ...content } 
	}else{
		bodyData[uploadType] = { ... body }
	}

	if(allowKeepAliveAgent) {
		const { keepAliveHttpAgent, keepAliveHttpsAgent } = keepAliveAgents()
		agents['http'] = keepAliveHttpAgent
		agents['https'] = keepAliveHttpsAgent 
	}

	return got(basepath + path, {
		...bodyData,
		agents,
		method,
		timeout: +timeoutMS,
		headers: newHeaders
	})

};

module.exports.buildCallPromises = ()=>{

}