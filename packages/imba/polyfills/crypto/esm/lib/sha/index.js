import sha from "./sha";
import sha1 from "./sha1";
import sha224 from "./sha224";
import sha256 from "./sha256";
import sha384 from "./sha384";
import sha512 from "./sha512";

const algorithms = {
    sha: sha,
    sha1: sha1,
    sha224: sha224,
    sha256: sha256,
    sha384: sha384,
    sha512: sha512
}

export default function SHA(algorithm) {
    algorithm = algorithm.toLowerCase();
    var Algorithm = algorithms[algorithm];
    if (!Algorithm)
        throw new Error(algorithm + ' is not supported (we accept pull requests)');
    return new Algorithm();
};;
export { sha };
export { sha1 };
export { sha224 };
export { sha256 };
export { sha384 };
export { sha512 };
