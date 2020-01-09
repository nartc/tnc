import { graphql } from "gatsby";
import React from "react";
import BlogList, { BlogsProps } from "../components/blogs/blog-list";

export default (props: BlogsProps) => <BlogList {...props} />;

export const blogsQuery = graphql`
  query blogsQuery($skip: Int!, $limit: Int!, $langKey: String!) {
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: [DESC] }
      filter: {
        frontmatter: { draft: { ne: true } }
        fields: { langKey: { eq: $langKey } }
      }
      limit: $limit
      skip: $skip
    ) {
      group(field: frontmatter___tags) {
        tag: fieldValue
        totalCount
      }
      edges {
        node {
          excerpt
          timeToRead
          frontmatter {
            langs
            date(formatString: " MM/DD/YYYY")
            tags
            title
            cover {
              childImageSharp {
                fluid(maxWidth: 1080, fit: COVER, quality: 80) {
                  ...GatsbyImageSharpFluid
                }
              }
            }
          }
          fields {
            slug
            langKey
          }
        }
      }
    }
    site {
      siteMetadata {
        socials {
          link
          type
        }
      }
    }
  }
`;
