/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

const { createFilePath } = require("gatsby-source-filesystem");
const path = require("path");

// You can delete this file if you're not using it
exports.onCreateNode = ({ node, getNode, actions }) => {
  const { type } = node.internal;
  const { createNodeField } = actions;
  if (type === "MarkdownRemark") {
    const slug = createFilePath({ node, getNode, basePath: "blogs" });
    createNodeField({
      node,
      name: "slug",
      value: slug,
    });
  }
};

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  const result = await graphql(`
    {
      allMarkdownRemark {
        edges {
          node {
            fields {
              slug
            }
            frontmatter {
              title
              tags
            }
          }
        }
      }
      site {
        siteMetadata {
          blogsPerPage
        }
      }
    }
  `);

  if (result.errors) {
    console.error(result.errors);
    throw new Error(result.errors);
  }

  // Templates
  const blogsTemplate = path.resolve("./src/templates/blogs.tsx");
  const blogTemplate = path.resolve("./src/templates/blog.tsx");

  const blogs = result.data.allMarkdownRemark.edges;
  const blogsPerPage = result.data.site.siteMetadata.blogsPerPage;
  const numPages = Math.ceil(blogs.length / blogsPerPage);

  Array.from({ length: numPages }).forEach((_, index) => {
    createPage({
      path: index === 0 ? "/blogs" : `/blogs/${index + 1}`,
      component: blogsTemplate,
      context: {
        limit: blogsPerPage,
        skip: index * blogsPerPage,
        numPages,
        currentPage: index + 1,
        total: blogs.length,
      },
    });
  });

  blogs.forEach(({ node }, index) => {
    const { slug } = node.fields;
    const prev = index === 0 ? null : blogs[index - 1].node;
    const next = index === blogs.length - 1 ? null : blogs[index + 1].node;

    createPage({
      path: "/blogs/" + slug.replace("/", ""),
      component: blogTemplate,
      context: {
        // Data passed to context is available in page queries as GraphQL variables.
        slug,
        prev,
        next,
        primaryTag: node.frontmatter.tags ? node.frontmatter.tags[0] : "",
      },
    });
  });
};
