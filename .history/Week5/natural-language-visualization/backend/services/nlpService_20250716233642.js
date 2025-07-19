const natural = require('natural');
const compromise = require('compromise');

class NLPService {
  constructor() {
    this.chartTypes = {
      'biểu đồ cột': 'bar',
      'biểu đồ tròn': 'pie', 
      'biểu đồ đường': 'line',
      'bar chart': 'bar',
      'pie chart': 'pie',
      'line chart': 'line'
    };

    this.dataFields = {
      'doanh thu': 'revenue',
      'bán hàng': 'sales',
      'lợi nhuận': 'profit',
      'revenue': 'revenue',
      'sales': 'sales',
      'profit': 'profit'
    };

    this.timeFrames = {
      'tháng': 'month',
      'năm': 'year', 
      'ngày': 'day',
      'month': 'month',
      'year': 'year',
      'day': 'day'
    };
  }

  async analyzeQuery(query) {
    const doc = compromise(query);
    const tokens = natural.WordTokenizer.tokenize(query.toLowerCase());
    
    // Phân tích loại biểu đồ
    const chartType = this.extractChartType(tokens);
    
    // Phân tích trường dữ liệu
    const dataField = this.extractDataField(tokens);
    
    // Phân tích khung thời gian
    const timeFrame = this.extractTimeFrame(tokens);
    
    // Phân tích bộ lọc
    const filters = this.extractFilters(doc);

    return {
      chartType,
      dataField,
      timeFrame,
      filters,
      originalQuery: query
    };
  }

  extractChartType(tokens) {
    for (const [key, value] of Object.entries(this.chartTypes)) {
      if (tokens.some(token => key.includes(token))) {
        return value;
      }
    }
    return 'bar'; // default
  }

  extractDataField(tokens) {
    for (const [key, value] of Object.entries(this.dataFields)) {
      if (tokens.some(token => key.includes(token))) {
        return value;
      }
    }
    return 'value'; // default
  }

  extractTimeFrame(tokens) {
    for (const [key, value] of Object.entries(this.timeFrames)) {
      if (tokens.some(token => key.includes(token))) {
        return value;
      }
    }
    return 'month'; // default
  }

  extractFilters(doc) {
    const filters = {};
    
    // Tìm số năm
    const years = doc.match('#Value').out('array').filter(val => {
      const num = parseInt(val);
      return num >= 2020 && num <= 2030;
    });
    
    if (years.length > 0) {
      filters.year = years[0];
    }

    return filters;
  }
}

module.exports = new NLPService();