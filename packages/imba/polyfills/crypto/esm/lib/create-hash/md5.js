import MD5 from "../md5/index.js";
export default (function (buffer) {
    return new MD5().update(buffer).digest();
});
