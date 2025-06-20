import React, { useEffect, useState } from "react";
import { db } from "./Config";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import {
  Container,
  Row,
  Col,
  ListGroup,
  Card,
  Spinner,
  Button,
} from "react-bootstrap";
import {
  FaInbox,
  FaEnvelope,
  FaPhoneAlt,
  FaClock,
  FaArrowLeft,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const Admin = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(data);
      setLoading(false);
    };

    fetchMessages();

    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };

    handleResize(); // initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderChatList = () => (
    <ListGroup variant="flush">
      {messages.map((msg) => (
        <ListGroup.Item
          key={msg.id}
          action
          active={selectedMessage?.id === msg.id}
          onClick={() => setSelectedMessage(msg)}
        >
          <strong>{msg.name}</strong>
          <div className="text-muted" style={{ fontSize: "0.85rem" }}>
            {msg.phone}
          </div>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );

  const renderChatMessage = () => {
    if (!selectedMessage) return null;

    const { service, message, phone, email, timestamp } = selectedMessage;

    return (
      <Card className="shadow-sm">
        {isMobileView && (
          <Button
            variant="light"
            className="text-start"
            onClick={() => setSelectedMessage(null)}
          >
            <FaArrowLeft className="me-2" />
            Back to Chats
          </Button>
        )}
        <Card.Body>
          <Card.Title className="fw-bold mb-3">{service}</Card.Title>
          <Card.Text className="mb-4" style={{ fontSize: "1.1rem" }}>
            {message}
          </Card.Text>
          <div className="text-muted small">
            <p>
              <FaPhoneAlt className="me-2" />
              {phone}
            </p>
            <p>
              <FaEnvelope className="me-2" />
              {email}
            </p>
            <p>
              <FaClock className="me-2" />
              {timestamp?.toDate().toLocaleString() || "—"}
            </p>
          </div>
        </Card.Body>
      </Card>
    );
  };

  return (
    <Container fluid className="py-4">
      <h2 className="mb-4 ps-3">
        <FaInbox className="me-2 text-primary" />
        Admin Messages
      </h2>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Row>
          {/* Chat List */}
          {!isMobileView || !selectedMessage ? (
            <Col
              md={2}
              style={{
                borderRight: "1px solid #ccc",
                maxHeight: "80vh",
                overflowY: "auto",
              }}
            >
              {renderChatList()}
            </Col>
          ) : null}

          {/* Chat Message */}
          {(!isMobileView || selectedMessage) && (
            <Col md={10} className="p-3">
              {selectedMessage ? (
                renderChatMessage()
              ) : (
                <p className="text-muted">Select a message to view</p>
              )}
            </Col>
          )}
        </Row>
      )}
    </Container>
  );
};

export default Admin;
