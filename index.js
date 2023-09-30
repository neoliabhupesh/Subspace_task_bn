const express = require('express');
var bodyParser = require('body-parser')
const fetch = require('node-fetch');
const port = 3000;
const app = express();
const _ = require('lodash');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const options = {
  method: 'GET',
  headers: {
    'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
  }
};
app.get('/api/blog-stats', async (req, res) => {
  try {
    const response = await fetch('https://intent-kit-16.hasura.app/api/rest/blogs', options);
    const data = await response.json();
    const totalBlogs = data.blogs.length;
    const longestTitleBlog = _.maxBy(data.blogs, 'title.length').title;
    const privacyBlogs = _.filter(data.blogs, (blog) =>
      _.includes(_.toLower(blog.title), 'privacy')
    );
    const numPrivacyBlogs = privacyBlogs.length;
    const uniqueTitles = _.uniqBy(data.blogs, 'title').map(
      (blog) => blog.title
    );
    const analyticsData = {
      totalBlogs,
      longestTitle: longestTitleBlog,
      numPrivacyBlogs,
      uniqueTitles,
    };
    res.json(analyticsData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/blog-search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing query parameter' });
    }
    const response = await fetch('https://intent-kit-16.hasura.app/api/rest/blogs', options);
    const data = await response.json();
    const searchResults = data.blogs.filter((blog) =>
      blog.title.toLowerCase().includes(query.toLowerCase())
    );
    res.json(searchResults);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
