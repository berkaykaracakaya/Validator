// Debug script to check localStorage
console.log('=== PROJECTS IN LOCALSTORAGE ===')
const projects = JSON.parse(localStorage.getItem('validator_projects') || '[]')
console.log(`Total projects: ${projects.length}`)

projects.forEach((p, index) => {
    console.log(`\n${index + 1}. ${p.name}`)
    console.log(`   ID: ${p.id}`)
    console.log(`   URL: ${p.url}`)
    console.log(`   Created: ${p.createdAt}`)
    console.log(`   Updated: ${p.updatedAt}`)
})

// Check for duplicates by URL
const urlCounts = {}
projects.forEach(p => {
    urlCounts[p.url] = (urlCounts[p.url] || 0) + 1
})

console.log('\n=== DUPLICATE CHECK ===')
Object.entries(urlCounts).forEach(([url, count]) => {
    if (count > 1) {
        console.log(`❌ DUPLICATE: ${url} appears ${count} times`)
    }
})

// If you want to clean up duplicates, uncomment:
// const uniqueProjects = []
// const seenUrls = new Set()
// projects.forEach(p => {
//   if (!seenUrls.has(p.url)) {
//     seenUrls.add(p.url)
//     uniqueProjects.push(p)
//   }
// })
// localStorage.setItem('validator_projects', JSON.stringify(uniqueProjects))
// console.log(`Cleaned up! Removed ${projects.length - uniqueProjects.length} duplicates`)
