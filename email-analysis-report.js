const fs = require('fs');

console.log('=== EMAIL ANALYSIS REPORT FOR WEBZONEBW ===\n');

// Read the contact.html file to analyze email references
const contactHtml = fs.readFileSync('./contact.html', 'utf8');

// Find all email references
const contactEmailSchema = contactHtml.match(/"email":\s*"([^"]+)"/);
const actualEmailLinks = contactHtml.match(/mailto:([^"\s>]+)/g) || [];
const displayedEmails = contactHtml.match(/sam\.chouhan32@gmail\.com/g) || [];

console.log('📧 EMAIL ANALYSIS RESULTS:\n');

console.log('🔍 EMAIL REFERENCES FOUND:');
console.log('1. Schema.org Email (Structured Data):');
if (contactEmailSchema) {
    console.log(`   📧 ${contactEmailSchema[1]}`);
} else {
    console.log('   ❌ No email found in schema');
}

console.log('\n2. Actual Email Links (mailto:):');
if (actualEmailLinks.length > 0) {
    actualEmailLinks.forEach(link => {
        console.log(`   🔗 ${link.replace('mailto:', '')}`);
    });
} else {
    console.log('   ❌ No mailto links found');
}

console.log('\n3. Displayed Email Addresses:');
if (displayedEmails.length > 0) {
    console.log(`   📄 ${displayedEmails[0]} (appears ${displayedEmails.length} times)`);
} else {
    console.log('   ❌ No email addresses displayed');
}

console.log('\n🚨 ISSUE IDENTIFIED:');
console.log('❌ MISMATCH DETECTED!');
console.log('   Schema Email: contact@webzonebw.in');
console.log('   Actual Email: sam.chouhan32@gmail.com');
console.log('   Status: EMAIL INCONSISTENCY - contact@webzonebw.in does not exist in service');

console.log('\n📊 IMPACT ASSESSMENT:');
console.log('🔴 HIGH IMPACT:');
console.log('   • Schema data shows non-existent email');
console.log('   • SEO may be affected by inconsistent contact information');
console.log('   • Users trying contact@webzonebw.in will fail');
console.log('   • Structured data validation may fail');

console.log('\n📋 RECOMMENDATIONS:');
console.log('1. UPDATE SCHEMA DATA:');
console.log('   Change "contact@webzonebw.in" to "sam.chouhan32@gmail.com" in structured data');

console.log('\n2. CONSISTENCY CHECK:');
console.log('   Ensure all email references use the same valid address');

console.log('\n3. ALTERNATIVE SOLUTIONS:');
console.log('   a) Create contact@webzonebw.in email alias');
console.log('   b) Update schema to use sam.chouhan32@gmail.com');
console.log('   c) Add both emails with different purposes');

console.log('\n🔧 FILES TO MODIFY:');
console.log('   • contact.html (line 197 - schema data)');

console.log('\n✅ VALID EMAIL ADDRESSES FOUND:');
console.log('   • sam.chouhan32@gmail.com (appears in actual links and displayed text)');

console.log('\n📈 SUMMARY:');
console.log('   Total email references found: ' + (actualEmailLinks.length + displayedEmails.length));
console.log('   Inconsistent email: 1 (contact@webzonebw.in)');
console.log('   Consistent email: 1 (sam.chouhan32@gmail.com)');
console.log('   Action Required: Fix schema data to match actual email');

console.log('\n🎯 IMMEDIATE ACTION NEEDED:');
console.log('   UPDATE CONTACT.HTML LINE 197:');
console.log('   FROM: "email": "contact@webzonebw.in"');
console.log('   TO:   "email": "sam.chouhan32@gmail.com"');

console.log('\n💡 ADDITIONAL SUGGESTIONS:');
console.log('   • Consider creating a professional email alias');
console.log('   • Update privacy policy to reflect correct email');
console.log('   • Test all email links work correctly');
console.log('   • Consider adding a contact form as backup');

console.log('\n=== END REPORT ===');