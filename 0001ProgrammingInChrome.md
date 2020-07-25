在Chrome浏览器中编程

只要你有浏览器，你就能练习编程。
这门课选择Chrome浏览器，是因为它在所有电脑上都能安装，无论你的操作系统是Windows，MacOS，合适Linux，你都可以安装Chrome。
Chrome的官方下载地址如下：
https://www.google.cn/chrome/
￼![image](https://user-images.githubusercontent.com/1572996/88445086-164d6600-ce53-11ea-9f78-86c1bcc39f56.png)
安装并打开Chrome之后，你可点击顶部视图栏的： 视图->开发者->开发者工具，打开浏览器自带的编程工具。
￼![image](https://user-images.githubusercontent.com/1572996/88445084-13527580-ce53-11ea-8eaf-8b28e983177a.png)
在> 后面输入1+1并回车，可以看到第二行显示2。
在> 后面输入alert('你好哇！’),
￼

复制以下内容并粘贴到>后面：

```javascript
const randomNums = [3, 3, 4, 6];
const operators = ['+', '-', '*', '/'];
const permutations = (nums) => {
  if (nums.length === 0) {
    return [[]];
  }
  const result = nums.map((num, i) => {
    const numsCopy = [...nums];
    numsCopy.splice(i, 1);
    return permutations(numsCopy).map((p) => [num, ...p]);
  }).flat();
  return result;
};
const repeatedPermutations = (nums, n) => {
  if (n === 0 || nums.length === 0) {
    return [[]];
  }
  const result = nums.flatMap((num, i) => repeatedPermutations(
    nums, n - 1,
  ).map((p) => [nums[i], ...p]));
  return result;
};

const results = new Set();
permutations(randomNums).forEach((numP) => {
  repeatedPermutations(operators, 3).forEach((opP) => {
    const expression = [numP[0], opP[0], numP[1], opP[1], numP[2], opP[2], numP[3]].join(' ');
    if (eval(expression) === 24) {
      results.add(expression);
    }
  });
});
Array.from(results.values()).forEach((r, i) => { console.log(`${i + 1} : ${r} = 24`); });
```javascript
