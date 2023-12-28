import _ from "lodash";
import { getUniqueId } from "../auxiliary/get-unique-id";

test("getUniqueId test", async () => {
  const randomArray = Array.from({ length: 100000 }).map(() => getUniqueId());
  expect(_.uniq(randomArray).length).toEqual(randomArray.length);
});
