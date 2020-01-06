/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

const kebabCase = require("lodash.kebabcase");
const { createFilePath } = require("gatsby-source-filesystem");
const path = require("path");

// You can delete this file if you're not using it
exports.onCreateNode = ({ node, getNode, actions }) => {
  const { type } = node.internal;
  const { createNodeField } = actions;
  if (type === "MarkdownRemark") {
    const filePath = createFilePath({ node, getNode, basePath: "blogs" });
    const splitPath = filePath.split(".");

    let slug, langKey;
    if (splitPath[1]) {
      slug = splitPath[0] + "/";
      langKey = splitPath[1].replace("/", "");
    } else {
      slug = splitPath[0];
      langKey = "en";
    }

    createNodeField({
      node,
      name: "slug",
      value: slug,
    });
    createNodeField({
      node,
      name: "langKey",
      value: langKey,
    });
  }
};

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  const result = await graphql(`
    {
      allMarkdownRemark(
        sort: { fields: [frontmatter___date], order: [ASC] }
        filter: { frontmatter: { draft: { ne: true } } }
      ) {
        group(field: frontmatter___tags) {
          tag: fieldValue
          edges {
            node {
              fields {
                langKey
              }
            }
          }
        }
        edges {
          node {
            fields {
              slug
              langKey
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
          langs
        }
      }
    }
  `);

  if (result.errors) {
    console.error(result.errors);
    throw new Error(result.errors);
  }

  // Templates
  const tagsTemplate = path.resolve("./src/templates/tags.tsx");
  const enBlogsTemplate = path.resolve("./src/templates/blogs.en.tsx");
  const viBlogsTemplate = path.resolve("./src/templates/blogs.vi.tsx");
  const blogTemplate = path.resolve("./src/templates/blog.tsx");

  const blogs = result.data.allMarkdownRemark.edges;
  const enBlogLength = blogs.filter(b => b.node.fields.langKey === "en").length;
  const blogsPerPage = result.data.site.siteMetadata.blogsPerPage;
  const langs = result.data.site.siteMetadata.langs;
  const tags = result.data.allMarkdownRemark.group;
  const numPages = Math.ceil(enBlogLength / blogsPerPage);

  tags.forEach(({ tag, edges }) => {
    const totalCount = edges.filter(edge => edge.node.fields.langKey === "en")
      .length;
    const tagsPageCount = Math.ceil(totalCount / blogsPerPage);
    Array.from({ length: tagsPageCount }).forEach((_, index) => {
      langs.forEach(lang => {
        let path =
          index === 0
            ? `/tags/${kebabCase(tag)}`
            : `/tags/${kebabCase(tag)}/${index + 1}`;
        path = lang === "en" ? path : `${lang}${path}`;
        createPage({
          path,
          component: tagsTemplate,
          context: {
            tag,
            langKey: lang,
            totalCount,
            currentPage: index + 1,
            numPages: tagsPageCount,
            limit: blogsPerPage,
            skip: index * blogsPerPage,
          },
        });
      });
    });
  });

  Array.from({ length: numPages }).forEach((_, index) => {
    langs.forEach(lang => {
      let path = index === 0 ? "/blogs" : `/blogs/${index + 1}`;
      path = lang === "en" ? path : `${path}/${lang}`;

      createPage({
        path,
        component: lang === "en" ? enBlogsTemplate : viBlogsTemplate,
        context: {
          langKey: lang,
          limit:
            lang === "en"
              ? blogsPerPage
              : blogs.length - enBlogLength + blogsPerPage,
          skip: index * blogsPerPage,
          numPages,
          currentPage: index + 1,
          total: blogs.length,
        },
      });
    });
  });

  const consolidatedBlogs = Object.values(
    blogs.reduce((acc, cur) => {
      acc[cur.node.fields.slug] = acc[cur.node.fields.slug]
        ? {
            ...acc[cur.node.fields.slug],
            langKeys: [
              ...acc[cur.node.fields.slug].langKeys,
              ...langs.filter(lang => cur.node.fields.langKey === lang),
            ],
          }
        : {
            ...cur.node.fields,
            primaryTag: cur.node.frontmatter.tags
              ? cur.node.frontmatter.tags[0]
              : "",
            langKeys: [cur.node.fields.langKey],
          };
      delete acc[cur.node.fields.slug].langKey;
      return acc;
    }, {})
  );

  consolidatedBlogs.forEach(
    ({ slug, langKeys, primaryTag }, index, blogsArr) => {
      const prev = index === 0 ? null : blogsArr[index - 1].node;
      const next =
        index === blogsArr.length - 1 ? null : blogsArr[index + 1].node;

      for (const langKey of langKeys) {
        createPage({
          path:
            "/blogs/" +
            (langKey === "vi" ? langKey + "/" : "") +
            slug.replace("/", ""),
          component: blogTemplate,
          context: {
            slug,
            langKey,
            prev,
            next,
            primaryTag,
          },
        });
      }
    }
  );
};
