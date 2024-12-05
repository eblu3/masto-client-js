var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function getInclude(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let include = new DocumentFragment();
            let response = yield fetch(url);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
            const includeHTML = yield response.text();
            new DOMParser().parseFromString(includeHTML, "text/html").querySelectorAll("*").forEach((node) => {
                include.appendChild(node);
            });
            return include;
        }
        catch (error) {
            console.error(error.message);
            return null;
        }
    });
}
//# sourceMappingURL=includes.mjs.map