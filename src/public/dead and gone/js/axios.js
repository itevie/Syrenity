// This file is purely just so there isn't an import error
// All it does is import the axios lib which exposes "axios" globally
// And we are returning what it created as typescript doesn't like
// global things i think
import "https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js";
// @ts-ignore
export default axios;
