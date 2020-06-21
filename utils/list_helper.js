const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.length === 0
    ? 0
    : blogs.reduce((total, current) => total + current.likes , 0)
}


const favoriteBlog = (blogs) => {
    if (blogs.length === 0) {
        return {}
    } else if (blogs.length === 1) {
        return blogs[0]
    } else {
        let blogindex = 0
        let likes = -1
        for (let i = 0; i < blogs.length ; i++) {
        
            if (blogs[i].likes > likes) {
                blogindex = i
                likes = blogs[i].likes
            }
        }

        return blogs[blogindex] 
    }
}


const mostBlogs = (blogs) => {
    if (blogs.length === 0) {
        return {}
    }
    else if (blogs.length === 1) {
        return {
            author: blogs[0].author,
            blogs: 1 
        }
    }
    else {
        let blogauthors = blogs.map(blog => blog.author)
        blogauthors.sort()

        var a = [], b = [], prev;
        for ( var i = 0; i < blogauthors.length; i++ ) {
            if ( blogauthors[i] !== prev ) {
                a.push(blogauthors[i]);
                b.push(1);
            } else {
                b[b.length-1]++;
            }
            prev = blogauthors[i];
        }

        indexMaxPosts = b.indexOf(Math.max(...b))

        return {
            author: a[indexMaxPosts],
            blogs: b[indexMaxPosts]
        }
    }     
       
}

const mostLikes = (blogs) => {
    if (blogs.length === 0) {
        return {}
    } else if (blogs.length === 1) {
        return {
            author: blogs[0].author,
            likes: blogs[0].likes
        }
    } else {
        const likes = blogs.map(blog => blog.likes)
        console.log(likes)
        const maxLikes = Math.max(...likes)
        console.log(maxLikes)
        result = blogs.find(blog => blog.likes === maxLikes)
        console.log(result)
        return {
            author: result.author,
            likes: result.likes
        }
    }
}

module.exports = {
    dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}
