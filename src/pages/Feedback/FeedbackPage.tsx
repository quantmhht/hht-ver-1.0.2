import { Button } from "@components";
import FeedbackSection from "@components/feedback/FeedbackSection";
import PageLayout from "@components/layout/PageLayout";
import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import tw from "twin.macro";
import { Box, Icon, useNavigate, Modal, List } from "zmp-ui";
import Background from "@assets/background.png";
import { useStore } from "@store";
import { FeedbackType } from "@dts";

const InfoContainer = styled(Box)`
    ${tw`bg-white flex items-center flex-col gap-4 `}
    background-image: url(${Background});
    background-position: center;
    background-repeat: no-repeat;
`;

const Title = styled.div`
    ${tw`text-[15px] text-[#767A7F]`}
`;

const FeedbackPage: React.FC = () => {
    const pageRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // --- BẮT ĐẦU MÃ NGUỒN MỚI ---
    const { feedbackTypes, getFeedbackTypes } = useStore((state) => ({
        feedbackTypes: state.feedbackTypes,
        getFeedbackTypes: state.getFeedbackTypes,
    }));

    const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);

    useEffect(() => {
        if (!feedbackTypes || feedbackTypes.length === 0) {
            getFeedbackTypes({});
        }
    }, []);

    const handleCategorySelect = (category: FeedbackType) => {
        setFeedbackModalVisible(false);
        navigate('/create-feedback', { state: { category } });
    };

    // Hàm onSendFeedback giờ sẽ mở Modal
    const onSendFeedback = () => {
        setFeedbackModalVisible(true);
    };
    // --- KẾT THÚC MÃ NGUỒN MỚI ---

    return (
        <PageLayout title="Góp ý - phản ánh" id="feedbacks" ref={pageRef}>
            <InfoContainer p={8} m={0}>
                <Title>Bạn có sự việc cần phản ánh?</Title>

                <Button
                    onClick={onSendFeedback}
                    suffixIcon={<Icon icon="zi-chevron-right" />}
                >
                    Gửi phản ánh
                </Button>
            </InfoContainer>

            <FeedbackSection />

            {/* --- BẮT ĐẦU MÃ NGUỒN MỚI: POP-UP CHỌN DANH MỤC --- */}
            <Modal
                visible={feedbackModalVisible}
                title="Chọn lĩnh vực phản ánh"
                onClose={() => setFeedbackModalVisible(false)}
            >
                <List>
                    {(feedbackTypes || []).map((item) => (
                        <List.Item 
                            key={item.id} 
                            title={item.title} 
                            onClick={() => handleCategorySelect(item)}
                        />
                    ))}
                </List>
            </Modal>
            {/* --- KẾT THÚC MÃ NGUỒN MỚI --- */}
        </PageLayout>
    );
};

export default FeedbackPage;