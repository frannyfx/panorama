let commits = [];
console.log(JSON.stringify(commits.map(commit => commit.commit.message.split("\n")[0].replace(/\s\s+/g, " ")), null, 4));