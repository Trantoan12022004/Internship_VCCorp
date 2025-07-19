import React, { Component } from "react";
import { Col, Container, Row } from "reactstrap";
import {chatWithGemini} from "../sevices/api";

// Import Background Image
import Background from "../assets/images/service-icon-bg.png";
import Icon1 from "../assets/images/services-icon/icon-1.png";



export default class Services extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [
        {
          id: 1,
          text: "Xin chào! Tôi có thể giúp bạn phân tích dữ liệu. Hãy đặt câu hỏi về dữ liệu của bạn.",
          sender: "system",
          timestamp: new Date().toLocaleTimeString()
        }
      ],
      inputMessage: '',
      isLoading: false
    };
    this.messagesEndRef = React.createRef();
  }

  scrollToBottom = () => {
    this.messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevState.messages.length !== this.state.messages.length) {
      this.scrollToBottom();
    }
  }

  sendMessage = async (e) => {
    e.preventDefault();
    if (!this.state.inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: this.state.inputMessage,
      sender: "user",
      timestamp: new Date().toLocaleTimeString()
    };

    this.setState(prevState => ({
      messages: [...prevState.messages, userMessage],
      inputMessage: '',
      isLoading: true
    }));
    console.log('User Message:', userMessage.text);
    try {
      // Gọi API chatWithGemini với field "question"
      const response = await chatWithGemini({ 
        question: userMessage.text 
      });
      console.log('API Response:', response);
      const systemMessage = {
        id: Date.now() + 1,
        text: response.data.answer || response.data.message || response.data.response || "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.",
        sender: "system",
        timestamp: new Date().toLocaleTimeString()
      };

      this.setState(prevState => ({
        messages: [...prevState.messages, systemMessage],
        isLoading: false
      }));

    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: error.response?.data?.message || "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.",
        sender: "system",
        timestamp: new Date().toLocaleTimeString()
      };

      this.setState(prevState => ({
        messages: [...prevState.messages, errorMessage],
        isLoading: false
      }));
    }
  };

  handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage(e);
    }
  };

  clearChat = () => {
    this.setState({
      messages: [
        {
          id: 1,
          text: "Xin chào! Tôi có thể giúp bạn phân tích dữ liệu. Hãy đặt câu hỏi về dữ liệu của bạn.",
          sender: "system",
          timestamp: new Date().toLocaleTimeString()
        }
      ]
    });
  };

  render() {
    const { messages, inputMessage, isLoading } = this.state;

    return (
      <React.Fragment>
        <section className="section bg-light" id="services">
          <Container>
            <Row className="justify-content-center">
              <Col lg={10}>
                <div className="text-center mb-5">
                  <h2 className="">AI Data Assistant</h2>
                  <p className="text-muted">Hỏi tôi bất cứ điều gì về dữ liệu của bạn. Tôi sẽ giúp bạn phân tích và tìm hiểu thông tin.</p>
                </div>
              </Col>
            </Row>
            
            <Row className="justify-content-center">
              <Col lg={8}>
                <div className="card chat-container p-4">
                  {/* Header */}
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="service-icon-bg avatar-sm p-2" style={{ backgroundImage: `url(${Background})` }}>
                      <img src={Icon1} alt="" className="img-fluid d-block" style={{width: '20px', height: '20px'}} />
                    </div>
                    <h5 className="mb-0">Chat với AI</h5>
                    <button 
                      className="btn btn-sm btn-outline-secondary"
                      onClick={this.clearChat}
                    >
                      Xóa chat
                    </button>
                  </div>

                  {/* Messages Container */}
                  <div 
                    className="messages-container mb-4"
                    style={{
                      height: '400px',
                      overflowY: 'auto',
                      border: '1px solid #e9ecef',
                      borderRadius: '8px',
                      padding: '15px',
                      backgroundColor: '#f8f9fa'
                    }}
                  >
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`message mb-3 d-flex ${
                          message.sender === 'user' ? 'justify-content-end' : 'justify-content-start'
                        }`}
                      >
                        <div
                          className={`message-content p-3 rounded ${
                            message.sender === 'user' 
                              ? 'bg-primary text-white' 
                              : 'bg-white border'
                          }`}
                          style={{
                            maxWidth: '70%',
                            wordWrap: 'break-word'
                          }}
                        >
                          <p className="mb-1" style={{fontSize: '14px', lineHeight: '1.4'}}>
                            {message.text}
                          </p>
                          <small className="opacity-75" style={{fontSize: '11px'}}>
                            {message.timestamp}
                          </small>
                        </div>
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="message mb-3 d-flex justify-content-start">
                        <div className="message-content p-3 rounded bg-white border" style={{maxWidth: '70%'}}>
                          <div className="d-flex align-items-center">
                            <div className="spinner-border spinner-border-sm me-2" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <span style={{fontSize: '14px'}}>Đang phân tích...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={this.messagesEndRef} />
                  </div>

                  {/* Input Form */}
                  <form onSubmit={this.sendMessage} className="d-flex gap-2">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => this.setState({inputMessage: e.target.value})}
                      onKeyPress={this.handleKeyPress}
                      placeholder="Nhập câu hỏi của bạn về dữ liệu..."
                      className="form-control"
                      rows="1"
                      disabled={isLoading}
                      style={{
                        resize: 'vertical',
                        minHeight: '40px',
                        maxHeight: '120px'
                      }}
                    />
                    <button
                      type="submit"
                      disabled={!inputMessage.trim() || isLoading}
                      className="btn btn-primary"
                      style={{minWidth: '80px'}}
                    >
                      {isLoading ? 'Đang gửi...' : 'Gửi'}
                    </button>
                  </form>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      </React.Fragment>
    );
  }
}