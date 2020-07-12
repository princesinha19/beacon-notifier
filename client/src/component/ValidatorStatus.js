import React, { useState } from "react";
import axios from "axios";
import {
    Row,
    Button,
    Card,
    Col,
    Form,
    Modal,
    CardDeck,
} from "react-bootstrap";

export default function ValidatorStatus() {
    const [successModal, setSuccessModal] = useState({ msg: "", open: false });
    const [errorModal, setErrorModal] = useState({ msg: "", open: false });
    const [subscribe, setSubscribe] = useState(true);
    const [validatorInfo, setValidatorInfo] = useState({
        email: "",
        index: "",
    });
    const [validatorStatus, setValidatorStatus] = useState({
        status: "",
        balance: "",
        slashed: "",
        activationEpoch: "",
    });

    const validateForm = () => {
        if (!validatorInfo.index) {
            setErrorModal({
                open: true,
                msg: "Public Key must be of 98 characters !!",
            });
        } else {
            if (subscribe) {
                handleAddValidator();
            } else {
                handleRemoveValidator();
            }
        }
    }

    const handleAddValidator = async () => {
        try {
            const res = await axios.get(
                "http://localhost:9000/validator/" +
                validatorInfo.index
            );

            if (res.data.result.length === 0) {
                axios.post
                    ("http://localhost:9000/validator", {
                        email: validatorInfo.email,
                        index: validatorInfo.index,
                    }, {
                        headers: {
                            "content-type": "application/json",
                        },
                    })
                    .then((_) => {
                        setSuccessModal({
                            open: true,
                            msg: "Successfully subscribed !!",
                        });
                    })
                    .catch((error) => {
                        setErrorModal({
                            open: true,
                            msg: error.message,
                        });
                    })
            } else {
                setErrorModal({
                    open: true,
                    msg: "Index already added !!",
                });
            }
        } catch (e) {
            setErrorModal({
                open: true,
                msg: e.message,
            });
        }
    }

    const handleRemoveValidator = async () => {
        try {
            const res = await axios.get(
                "http://localhost:9000/validator/" +
                validatorInfo.index
            );

            if (res.data.result.length > 0) {
                axios.delete
                    ("http://localhost:9000/validator", {
                        data: {
                            index: validatorInfo.index
                        }
                    })
                    .then((_) => {
                        setSuccessModal({
                            open: true,
                            msg: "Successfully Unsubscribed !!",
                        });
                    })
                    .catch((error) => {
                        setErrorModal({
                            open: true,
                            msg: error.message,
                        });
                    })
            } else {
                setErrorModal({
                    open: true,
                    msg: "Index doesn't exists !!",
                });
            }
        } catch (e) {
            setErrorModal({
                open: true,
                msg: e.message,
            });
        }
    }

    const handleValidatorStatus = () => {
        axios.get
            (
                "https://api.prylabs.net/eth/v1alpha1/validator?index=" +
                validatorInfo.index
            )
            .then(async (res) => {
                const result = await axios.get(
                    "https://api.prylabs.net/eth/v1alpha1/validator/statuses?indices=" +
                    validatorInfo.index,
                );

                setValidatorStatus({
                    status: result.data.statuses[0].status,
                    slashed: (res.data.slashed).toString().toUpperCase(),
                    balance: res.data.effectiveBalance,
                    activationEpoch: res.data.activationEpoch,
                })
            })
            .catch((error) => {
                console.log(error)
                setErrorModal({
                    open: true,
                    msg: error.message,
                });
            });
    }

    const handleClearStatus = () => {
        setValidatorStatus({
            status: "",
            slashed: "",
            balance: "",
            activationEpoch: "",
        });
    }

    const handleReload = () => {
        window.location.reload();
    }

    return (
        <div style={{ width: "100%" }}>
            <Card
                className="mx-auto"
                style={{ width: "50%", marginTop: "5%" }}
            >
                <Card.Header style={{ fontSize: "2rem", textAlign: "center" }}>
                    BEACON ALERT
                </Card.Header>

                <Card.Body>
                    <Row>
                        <Col>
                            <div key={`inline-radio`} className="mb-3">
                                <Form.Check
                                    inline
                                    label="Subscribe"
                                    type="radio"
                                    id={`inline-radio-1`}
                                    checked={subscribe}
                                    onChange={() => setSubscribe(true)}
                                />
                                <Form.Check
                                    inline
                                    label="Unsubscribe"
                                    type="radio"
                                    id={`inline-radio-2`}
                                    checked={!subscribe}
                                    onChange={() => setSubscribe(false)}
                                />
                            </div>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <Form.Label className="bold">Validator Index</Form.Label>
                            <Form.Control
                                className="mb-4"
                                type="number"
                                placeholder="Enter Validator Index (Eg. 23250)"
                                onChange={(e) => setValidatorInfo({
                                    ...validatorInfo,
                                    index: e.target.value
                                })}
                                value={validatorInfo.index}
                                required
                            />
                        </Col>
                    </Row>

                    {subscribe ?
                        <Row>
                            <Col>
                                <Form.Label className="bold">Email Address</Form.Label>
                                <Form.Control
                                    className="mb-4"
                                    type="email"
                                    placeholder="Your email address (Eg. abc@gmail.com)"
                                    onChange={(e) => setValidatorInfo({
                                        ...validatorInfo,
                                        email: e.target.value
                                    })}
                                    value={validatorInfo.email}
                                    required
                                />
                            </Col>
                        </Row>
                        : null
                    }
                </Card.Body>

                <Card.Footer className="text-center">
                    {subscribe ?
                        <Button
                            onClick={validateForm}
                            variant="outline-success"
                        >
                            Subscribe
                        </Button>
                        :
                        <Button
                            onClick={validateForm}
                            variant="outline-danger"
                        >
                            Unsubscribe
                        </Button>
                    }
                </Card.Footer>
            </Card>

            <Card
                className="mx-auto"
                style={{ width: "80%", marginTop: "4%" }}
            >
                <Card.Header style={{ fontSize: "1.5rem", textAlign: "center" }}>
                    VALIDATOR CURRENT STATUS
                </Card.Header>

                <Card.Body>
                    <Row>
                        <Col>
                            <Form.Control
                                className="mb-4 mx-auto"
                                type="number"
                                style={{ width: "20%", textAlign: "center" }}
                                placeholder="Enter Validator Index"
                                onChange={(e) => setValidatorInfo({
                                    ...validatorInfo,
                                    index: e.target.value
                                })}
                                value={validatorInfo.index}
                                required
                            />
                        </Col>
                    </Row>

                    <CardDeck style={{ textAlign: "center" }}>
                        <Card>
                            <Card.Header>Status</Card.Header>
                            <Card.Body>{validatorStatus.status}</Card.Body>
                        </Card>
                        <Card>
                            <Card.Header>Slashed</Card.Header>
                            <Card.Body>{validatorStatus.slashed}</Card.Body>
                        </Card>
                        <Card>
                            <Card.Header>Balance</Card.Header>
                            <Card.Body>{validatorStatus.balance}</Card.Body>
                        </Card>
                        <Card>
                            <Card.Header>Activation Epoch</Card.Header>
                            <Card.Body>{validatorStatus.activationEpoch}</Card.Body>
                        </Card>
                    </CardDeck>
                </Card.Body>
                <Card.Footer>
                    <Button
                        variant="info"
                        onClick={handleValidatorStatus}
                    >
                        GET
                    </Button>


                    <Button
                        variant="warning"
                        style={{ marginLeft: "3rem" }}
                        onClick={handleClearStatus}
                    >
                        CLEAR
                    </Button>
                </Card.Footer>
            </Card>

            <Modal
                show={successModal.open}
                onHide={() => setSuccessModal({ ...successModal, open: false })}
                animation={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Succesful</Modal.Title>
                </Modal.Header>
                <Modal.Body>{successModal.msg}</Modal.Body>
                <Modal.Footer>
                    <Button variant="info" onClick={handleReload}>
                        Ok
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={errorModal.open}
                onHide={() => setErrorModal({ ...errorModal, open: false })}
                animation={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Opps!! Error...</Modal.Title>
                </Modal.Header>
                <Modal.Body>{errorModal.msg}</Modal.Body>
                <Modal.Footer>
                    <Button variant="danger"
                        onClick={() => setErrorModal({ ...errorModal, open: false })}
                    >
                        Ok
                    </Button>
                </Modal.Footer>
            </Modal>
        </div >
    );
}
