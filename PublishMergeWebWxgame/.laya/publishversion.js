const fs = require("fs");
const path = require("path");

function isNullOrEmpty(x) {
    if (x instanceof Array)
        return x == null || x == undefined;
    return x == null || x == undefined || x == "";
}

class VersionData
{
    
    constructor()
    {
        // 第一部分为主版本号
        this.master = 0;
    
        // 第二部分为次版本号, 需要更新app版本
        this.minor = 0;
    
        // 第三部分为修订版
        this.revised = 0;
    
        // 第四部分为修订版
        this.revised2 = 0;

    }

	get isZero()
	{
		return this.master == 0 &&
			this.minor == 0 &&
			this.revised == 0 &&
			this.revised2 == 0;
	}

	setVersionTxt(versionTxt)
	{
		if (versionTxt === undefined || versionTxt === null)
			return this;

		if (isNullOrEmpty(versionTxt.trim()))
			return this;

		versionTxt = versionTxt.toLowerCase();
		versionTxt = versionTxt.replace("version:", "").replace("version", "").replace("ver", "").replace("v", "");



		var arr = versionTxt.split('.');
		this.master = parseInt(arr[0]);

		if (arr.length > 1)
			this.minor = parseInt(arr[1]);

		if (arr.length > 2)
			this.revised = parseInt(arr[2]);

		if (arr.length > 3)
			this.revised2 = parseInt(arr[3]);

		return this;
	}

	equal(target)
	{
		return this.master == target.master
			&& this.minor == target.minor
			&& this.revised == target.revised
			&& this.revised2 == target.revised2;
	}



	toString()
	{
		return `v${this.master}.${this.minor}.${this.revised}.${this.revised2}`
	}
}


var workSpaceDir = global.workSpaceDir ;
console.log("workSpaceDir", workSpaceDir);

var verCachePath =  path.join(workSpaceDir, ".laya", `_ver.json`);

var verCache = 
{
	// 应用版本： 1.0.0.0
	AppVersion: new VersionData(),
	// 资源版本： 1.0.0.0
	ResVersion: new VersionData()
}

function readVersionCacheFile()
{
    if(fs.existsSync(verCachePath))
    {
        var json =  fs.readFileSync(verCachePath, "utf8");
        json = JSON.parse(json);
        verCache.AppVersion.setVersionTxt(json.AppVersion);
        verCache.ResVersion.setVersionTxt(json.ResVersion);
    }

    return verCache;
}

function saveVersionCacheFile()
{
    var json = 
    {
        AppVersion: verCache.AppVersion.toString(),
        ResVersion: verCache.ResVersion.toString(),
    };
    json = JSON.stringify(json, null, 4);
    fs.writeFileSync(verCachePath, json, {flag: 'w', encoding:'utf8'});
}



function getResVersion(isAddVer = true)
{
    readVersionCacheFile();
    if(isAddVer)
    {
        verCache.ResVersion.revised2 ++;
        saveVersionCacheFile();
    }
    return verCache.ResVersion.toString();
}

function getAppVersion(isAddVer = true)
{
    readVersionCacheFile();
    if(isAddVer)
    {
        verCache.AppVersion.revised2 ++;
        saveVersionCacheFile();
    }
    return verCache.AppVersion.toString();
}

function modifyVersionConfigJSForGameBin(isAddVer = true)
{
    var jsfilePath = path.join(workSpaceDir,  `bin/js/VersionConfig.js`);
    modifyVersionConfigJS(jsfilePath, isAddVer);
}

function modifyVersionConfigJSForReleaseWeb(isAddVer = true)
{
    var jsfilePath = path.join(workSpaceDir,  `release/web/js/VersionConfig.js`);
    modifyVersionConfigJS(jsfilePath, isAddVer);
}

function modifyVersionConfigJS(jsfilePath, isAddVer = true)
{
    if(!fs.existsSync(jsfilePath))
    {
        console.error("不存在文件:", jsfilePath);
        return;
    }
    
    var text =  fs.readFileSync(jsfilePath, "utf8");
    var reg= /AppVersion\s*:\s*(.*)/gim
    text = text.replace(reg, `AppVersion : "${getAppVersion(isAddVer)}",`);

    var reg= /ResVersion\s*:\s*(.*)/gim
    text = text.replace(reg, `ResVersion : "${getResVersion(isAddVer)}",`);

    
    fs.writeFileSync(jsfilePath, text, {flag: 'w', encoding:'utf8'});
}

module.exports = 
{
    getResVersion:getResVersion,
    getAppVersion:getAppVersion,
    modifyVersionConfigJS:modifyVersionConfigJS,
    modifyVersionConfigJSForGameBin:modifyVersionConfigJSForGameBin,
    modifyVersionConfigJSForReleaseWeb:modifyVersionConfigJSForReleaseWeb,
}