import React, { Component } from 'react'
import { Box, Text, Anchor } from 'grommet'
import Pagination from 'react-js-pagination'
import 'bootstrap/dist/css/bootstrap.min.css'

class News extends Component {
  render() {
    const {
      props: {
        news: {
          totalResults,
          articles,
          page
        },
        newsPageSize,
        onNewsPageChange
      }
    } = this
    return (
      <Box
        pad={{ vertical: '1rem', horizontal: '1rem' }}
      >
        <Box
          align="center"
          justify="center"
          pad={{ vertical: '1rem', horizontal: '1rem' }}
        >
          <Pagination
            activePage={page}
            itemsCountPerPage={newsPageSize}
            totalItemsCount={totalResults}
            pageRangeDisplayed={5}
            onChange={(page) => onNewsPageChange(page)}
            itemClass="page-item"
            linkClass="page-link"
          />
        </Box>
        <Box
          pad={{ vertical: '1rem', horizontal: '1rem' }}
          align="center"
        >
          {articles.map((article, idx) => (
            <Box
              key={idx}
              pad={{ vertical: '1rem', horizontal: '1rem' }}
              margin={{ vertical: '1rem' }}
              width={{ min: '10rem', max: '50rem' }}
              border={{ color: 'brand', size: 'small' }}
            >
              <Box pad={{ bottom: '1rem' }}>
                <Text weight="bold" textAlign="center" size="1.1rem">
                  {article.title}
                </Text>
              </Box>
              <Box pad={{ bottom: '0.5rem' }}>
                <Text>
                  {article.description}
                </Text>
              </Box>
              <Box>
                <Anchor
                  label={'Read More'}
                  href={article.url}
                  target="_blank"
                />
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }
}

export default News