import { graphql } from "gatsby";
import React, { useMemo } from "react";
import BlogList, { BlogsProps } from "../components/blogs/blog-list";

export default (props: BlogsProps) => {
  const {
    data: {
      allMarkdownRemark: { edges },
    },
    pageContext: { langKey },
  } = props;

  const updatedEdges = useMemo(
    () =>
      Object.values(
        edges.reduce((acc, cur) => {
          const slug = cur.node.fields?.slug ?? "";
          if (!acc[slug]) {
            acc[slug] = { ...cur };
          } else {
            if (cur.node.fields?.langKey === langKey) {
              acc[slug] = { ...cur };
            }
          }
          return acc;
        }, {} as any)
      ),
    [edges, langKey]
  );

  return (
    <BlogList
      {...props}
      data={{
        ...props.data,
        allMarkdownRemark: {
          ...props.data.allMarkdownRemark,
          edges: [...(updatedEdges as any)],
        },
      }}
    />
  );
};

export const viBlogsQuery = graphql`
  query viBlogsQuery($skip: Int!, $limit: Int!) {
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: [DESC] }
      filter: { frontmatter: { draft: { ne: true } } }
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
