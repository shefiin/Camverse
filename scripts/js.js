// let obj = {
//     name: 'shefin',
//     place: 'kozhikode'
// }

// delete obj.place;
// obj.age = 24

// console.log(obj);


// let obj = {
//     name: 'shefin',
//     place: 'kozhikode'
// }

// obj.job = 'Developer'

// console.log(Object.values(obj))
// console.log(Object.keys(obj))
// console.log(obj)



// let obj = {
//     name: 22,
//     job: 15,
//     place: 43,
// }

// let highest = Object.entries(obj).reduce((acc, curr) => {
//     if(curr > acc){
//         acc = curr;
//     }
//     return acc;
// });

// console.log(highest);

// let prop = Object.entries(obj)
// console.log(prop);

// prop.splice(prop.length - 1, 1)
// console.log(prop)



const scores = {  
    alice: 42,  
    bob: 75,  
    charlie: 62  
  };

const { json } = require('body-parser');
//   console.log(Object.entries(scores));
  

//   const highestKey = Object.entries(scores).reduce((acc, curr) => {
//     return curr[1] > acc[1] ? curr : acc;
//   })[0];

//   console.log(highestKey);



// let highest = Object.entries(scores).reduce((acc, curr) => {
//     return curr[1] > acc[1] ? curr : acc;  
// })[0];


// console.log(highest);


// function removeLast(obj) {
//   let prop = Object.entries(obj)
//   prop.splice((prop.length - 1, 1))
//   return obj
// };

// obj1 = {name: 'shefin', age: 23};
// console.log(removeLast(obj1))


// function removeLast(obj) {
//   let keys = Object.keys(obj);
//   const lastKey = keys[keys.length -1]
//   delete obj[lastKey];
//   return obj
// }


// let obj = { name: 'shefin', place: 'koduvally'};
// let keys = Object.keys(obj);
// let lastKey = keys[keys.length -1]
// delete obj[lastKey];
// console.log(obj);



// let obj1 = {a: 1};
// let obj2 = {b: 2};

// Object.assign(obj1, obj2)
// console.log(obj1);



// function normal() {
//   return 1;
//   return 2;
// }

// console.log(normal())



// function* genFunc() {
//   yield 1;
//   yield 2;
//   yield 3;
// };

// const gen = genFunc();
// console.log(gen.next().value);
// console.log(gen.next().value);
// console.log(gen.next().value);


// function* infiniteCounter() {
//   let i = 1;
//   while(true){
//     yield i++;
//   }
// }

// const counter = infiniteCounter();
// console.log(counter.next().value);
// console.log(counter.next().value);
// console.log(counter.next().value);
// console.log(counter.next().value);
// console.log(counter.next().value);
// console.log(counter.next().value);
// console.log(counter.next().value);




// function createUser(name, age) {
//   return {
//     name: name,
//     age: age,
//     greet(){
//       console.log(`Hi, I am ${this.name} and I am ${this.age} years old.`)
//     }
//   };
// }

// const user1 = createUser('shefin', 23);
// const user2 = createUser('aisha', 25)

// user1.greet()
// user2.greet()


// let arr = [1,2,3,6,6,4];
// let uniqueArr = [...new Set(arr)];
// let sorted = uniqueArr.sort((a, b) => a - b)
// console.log(uniqueArr[uniqueArr.length - 2])
// console.log(uniqueArr[1]);


// function secondLargestAndSmallest(arr) {
//   let max = -Infinity, secondMax = -Infinity;
//   let min = Infinity, secondMin = Infinity;

//   for (let num of arr) {
//     if (num > max) {
//       secondMax = max;
//       max = num;
//     } else if (num > secondMax && num < max) {
//       secondMax = num;
//     }

//     if (num < min) {
//       secondMin = min;
//       min = num 
//     } else if (num < secondMin && num > min){
//       secondMin = num;
//     }
//   }
//   return { secondSmallest : secondMin, secondLargest: secondMax }
  
// }

// let arr = [1,6,4,84,93,45,1,88]
// console.log(secondLargestAndSmallest(arr));





// function checkPalindrome(str) {
//   let reversed = str.split('').reverse().join('');
//   if (reversed == str){
//     console.log('String is palindrome');
//   } else console.log('String is not palindrome');
  
// }

// checkPalindrome('shefin')


// function isPalindrome(str){
//   let reversed = str.split('').reverse().join('');
//   return str === reversed;
// }
// console.log(isPalindrome('star'));
// console.log(isPalindrome('madam'));


// function convert(str){
//   let reversed = str.split(' ').reverse().join(' ');
//   console.log(reversed);
// }

// convert("Hello World")


// let str = "hello world";

// let result = str
//     .split(' ')
//     .map(word => word.split('').reverse().join(''))
//     .join(' ');

// console.log(result)

// function flattenArray(arr) {
//   let result = [];

//   arr.forEach(element => {
//       if (Array.isArray(element)) {
//           result = result.concat(flattenArray(element)); 
//       } else {
//           result.push(element);
//       }
//   });

//   return result;
// }

// console.log(flattenArray([1, [2, [3, 4]], 5])); 



// function flattenArray(arr) {
//   let final = [];

//   arr.forEach(element => {
//     if (Array.isArray(element)){
//       final = final.concat(flattenArray(element));
//     } else {
//       final.push(element);
//     }
//   })
//   return final;
// }

// console.log(flattenArray([1,[2,4,5,[4,67],6],5,[2,10]]));

// const arr = [1, [2, [3, [4, 5]]]];
// const flattened = arr.flat(Infinity);
// console.log(flattened)


// function removeConsecutiveOdds(arr) {
//   return arr.filter((num, index) => {
//     return num % 2 === 0 || arr[index - 1] % 2 === 0;
//   });
// }

// let numbers = [2,3,5,8,11,13,4,7,9,10];
// let result = removeConsecutiveOdds(numbers);
// console.log(result)


// const obj = {};

// if (Object.keys(obj).length === 0){
//   console.log("Object is empty");
// } else {
//   console.log('object is not empty');
// }


// let arr = [1, 2, 3, 2, 4, 3, 5];
// let uniqueArr = [];

// for (let i of arr){
//   if (!uniqueArr.includes(arr[i])){
//     uniqueArr.push(arr[i])
//   }
// }

// console.log(uniqueArr);


// const students = [
//   { name: "John", mark: 75 },
//   { name: "Sara", mark: 85 },
//   { name: "Mike", mark: 65 }
// ];

// const maxMark = students.reduce((max, student) => {
//   return student.mark > max ? student.mark : max;
// }, students[0].mark);

// console.log(maxMark)


// const numbers = [1,[2,3],4];
// const [a, [b,c], d] = numbers;

// console.log(a);
// console.log(b);
// console.log(c);


// const student = {
//   name: 'john',
//   scores: {
//     math: 90,
//     science: 82
//   }
// };

// const { name, scores: { math, science } } = student;
// console.log(name);
// console.log(math);
// console.log(science)


// let arr = [1,2,3,4,5,5,6]
// let n = 2;
// arr.splice(n, 1);
// console.log(arr);


// let arr = ['richu', 'fathu', 'chungudu'];

// let capitalized = arr.map(word => {
//   return word[0].toUpperCase() + word.slice(1)
// })

// console.log(capitalized);



// let arr = ['shefin', 'sinu', 'kappi', 'chungudu'];

// let longest = arr.reduce((longestWord, currentWord) => {
//   return currentWord.length > longestWord.length ? currentWord : longestWord
// }, "");

// console.log(longest);


// function* multipliesOf(num){
//   let multiplier = 1
//   while(true){
//     yield num * multiplier;
//     multiplier++;
//   }
// }

// const gen = multipliesOf(5)

// console.log(gen.next().value);
// console.log(gen.next().value);
// console.log(gen.next().value);
// console.log(gen.next().value);
// console.log(gen.next().value);
// console.log(gen.next().value);
// console.log(gen.next().value);
// console.log(gen.next().value);
// console.log(gen.next().value);
// console.log(gen.next().value);


// console.log(this);


// let person = {
//   name: 'shefin',
//   greet() {
//     console.log(`Hi my name is ${this.name}`);
    
//   }
// }

// person.greet()


// const http = require('http');

// const server = http.createServer((req, res) => {
//   res.writeHead(200, {"Content-Type" : "text/plain" });
//   res.end('hello world');
// });

// server.listen(5000, () => {
//   console.log('server running');
  
// })



// const fs = require('fs');

// fs.readFile('sample.txt', 'utf8', (err, data) => {
//   if(err){
//     console.log('Something went wrong',err); 
//   } else {
//     console.log('file content:', data);    
//   }
// });


// const https = require('http');
// function fetchData(url){
//   https.get(url, (res) => {
//     let data = '';
//     res.on('data', (chunk) => {
//       data += chunk;
//     });
//     res.on('end', () => {
//       console.log(JSON.parse(data));
//     });
//   }).on('error', (err) => {
//     console.log('error fatching data', err);  
//   });
// }


// const bcrypt = require('bcrypt');

// const plain = '1234567s';
// const hash = '$2b$10$mRGg2EfnP6xzI11XA9sWDekNuzev4I0pnb1/eYMS9gr0D4A/X1i5y';

// bcrypt.compare(plain, hash).then(result => {
//   console.log('Password match:', result); // true or false
// });


// const bcrypt = require('bcrypt');

// const plainPassword = '1234567s';
// const storedHash = '$2b$10$vCTkPgoaqouNQqBqXUvx3uPBCeNTbW1t.Cec7kBwewPuEFaE4xZ/e';

// bcrypt.compare(plainPassword, storedHash)
//   .then(match => console.log('Password match:', match))
//   .catch(err => console.error(err));

// const bcrypt = require('bcrypt');
// bcrypt.hash('Test1234', 10).then(console.log);


// const bcrypt = require('bcrypt');

// async function checkPassword() {
//   const plainPassword = 'shefincat2023';
//   const storedHash = '$2b$10$cd0EorOGA/FyEPuTUvwfLeqradRyB6uiPg.vFuv6wQpIy.YBcL1sm';

//   const isMatch = await bcrypt.compare(plainPassword, storedHash);

//   console.log('Password match:', isMatch);
// }

// checkPassword();





{/* <div class="flex justify-between text-gray-600 mb-2 font-extralight">
<span>Total MRP</span>
<span>₹<%= totalMRP.toLocaleString() %>.00</span>
</div>
<div class="flex justify-between text-gray-600 mb-2 font-extralight">
<span>Discount</span>
<span class="text-green-400">- ₹<%= totalDiscount.toLocaleString() %>.00</span>
</div> */}


// totalMRP = cart.items.reduce((sum, item) => {
// return sum + (item.product.mrp * item.quantity);
// });

// totalDiscount = cart.items.reduce((sum, item) => {
// return sum + (((item.product.mrp - item.product.price)))
// })



const customOrder = ["Mango", "Apple", "Orange", "Banana"];

const fruits = ["Banana", "Apple", "Mango", "Orange"];

fruits.sort((a, b) => {
  return customOrder.indexOf(a) - customOrder.indexOf(b);
})

console.log(fruits);
