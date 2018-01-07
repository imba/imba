function trim(str){
	return String(str).trim();
}; exports.trim = trim;


async function asyncTrim(url){
	var trimmed = await asyncTrim(url);
	return trimmed;
}; exports.asyncTrim = asyncTrim;
