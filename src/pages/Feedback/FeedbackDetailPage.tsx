import ImageSwiper from "@components/feedback/ImageSwiper";
import PageLayout from "@components/layout/PageLayout";
import { useStore } from "@store";
import { formatDateTime } from "@utils/date-time";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import styled from "styled-components";
import tw from "twin.macro";
import { Box, Icon, useNavigate, Text, Button, useSnackbar } from "zmp-ui";
import { TextArea } from "@components";
import { getUserRole } from "@utils/auth";

const Container = styled(Box)`
    ${tw`bg-white`}
`;

const HeaderContainer = styled.div`
    ${tw`grid grid-cols-2 gap-2 mb-2 leading-5`}
`;

const TimeContainer = styled.div`
    ${tw`flex items-center gap-1 justify-end text-[#767A7F] text-[12px] `}
`;

const FeedbackType = styled.div`
    ${tw` border-[#D7EDFF] text-[12px] border w-fit px-2 py-0.5 text-[#046DD6] rounded-xl font-medium h-fit`}
`;

const Date = styled.div`
    ${tw``}
`;

const Title = styled.div`
    ${tw`font-medium `}
`;

const Content = styled.div`
    ${tw`text-[#767A7F] whitespace-pre-wrap`}
`;

const Response = styled.div`
    ${tw`whitespace-pre-line`}
`;

const Hr = styled.div`
    ${tw`border-b-[1.5px] my-4 border-[#F4F5F6]`}
`;

const FeedbackDetailPage: React.FC = () => {
    const { openSnackbar } = useSnackbar();
    const { id } = useParams();
    const navigate = useNavigate();

    const [feedback, getFeedback, user, replyToFeedback, replying] = useStore((state) => [
        state.feedbackDetail,
        state.getFeedback,
        state.user,
        state.replyToFeedback,
        state.creatingFeedback, // Tái sử dụng state loading
    ]);

    const [responseText, setResponseText] = useState("");
    
    // ✅ Sử dụng getUserRole với fallback
    const userRole = getUserRole(user?.idByOA, user?.id);
    const isAdmin = userRole === "admin" || userRole === "mod";

    useEffect(() => {
        if (!id) {
            navigate("/", { animate: false, replace: true });
        } else {
            getFeedback({ id });
        }
    }, [id]);

    const handleReplySubmit = async () => {
        if (!responseText.trim() || !id) {
            openSnackbar({
                text: "Nội dung trả lời không được để trống.",
                type: "error",
            });
            return;
        }
        const success = await replyToFeedback(id, responseText);
        if (success) {
            openSnackbar({ text: "Gửi trả lời thành công!", type: "success" });
            setResponseText(""); // Xóa nội dung đã nhập
        } else {
            openSnackbar({ text: "Gửi trả lời thất bại!", type: "error" });
        }
    };

    return (
        <PageLayout title="Chi tiết phản ánh">
            {feedback?.imageUrls && (
                <ImageSwiper imageUrls={feedback.imageUrls} />
            )}

            <Container p={4} mb={2}>
                <HeaderContainer>
                    <FeedbackType style={{ backgroundColor: "rgba(18, 174, 226, 0.1)" }}>
                        {feedback?.type}
                    </FeedbackType>
                    <TimeContainer>
                        <Date>{formatDateTime(feedback?.creationTime)}</Date>
                        <Icon size={13} icon="zi-clock-1" />
                    </TimeContainer>
                </HeaderContainer>
                <Title>{feedback?.title}</Title>
                <Hr />
                <Content>{feedback?.content}</Content>
                
                {/* ✅ Debug info trong development */}
                {import.meta.env.DEV && (
                    <Box className="mt-4 p-2 bg-gray-100 rounded text-xs">
                        <Text size="xSmall" className="font-mono">
                            Debug: Role={userRole}, isAdmin={isAdmin}, IDs: {user?.idByOA || 'N/A'}, {user?.id || 'N/A'}
                        </Text>
                    </Box>
                )}
            </Container>

            <Container p={4}>
                <HeaderContainer>
                    <Title>Trả lời phản ánh</Title>
                    {feedback?.responseTime && (
                         <TimeContainer>
                            <Date>{formatDateTime(feedback.responseTime)}</Date>
                            <Icon size={13} icon="zi-clock-1" />
                        </TimeContainer>
                    )}
                </HeaderContainer>
                <Hr />
                
                {/* --- Logic hiển thị có điều kiện --- */}
                {feedback?.response ? (
                    <Response>{feedback.response}</Response>
                ) : isAdmin ? (
                    <Box>
                        <TextArea
                            label="Nội dung trả lời"
                            placeholder="Nhập nội dung trả lời..."
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                        />
                        <Button
                            fullWidth
                            className="mt-4"
                            onClick={handleReplySubmit}
                            loading={replying}
                        >
                            Gửi trả lời
                        </Button>
                    </Box>
                ) : (
                    <Text size="xSmall" className="text-gray-500">Chưa có phản hồi từ cơ quan chức năng.</Text>
                )}
            </Container>
        </PageLayout>
    );
};

export default FeedbackDetailPage;