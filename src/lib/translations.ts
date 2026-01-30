export type Language = 'en' | 'ko';

export const translations = {
    en: {
        nav: {
            calendar: 'Calendar',
            stats: 'Stats',
            add: 'Add',
            search: 'Search',
            settings: 'Settings',
        },
        actions: {
            save: 'Save',
            cancel: 'Cancel',
            delete: 'Delete',
            edit: 'Edit',
            create: 'Create',
            add: 'Add',
            close: 'Close',
            back: 'Back',
            saving: 'Saving...',
            deleting: 'Deleting...',
            confirmDelete: 'Are you sure you want to delete this log?',
            fillRequired: 'Please enter a Title and select a Category.',
            newLog: 'New Log',
            editLog: 'Edit Log',
            saveLog: 'Save Log',
            updateLog: 'Update Log',
        },
        settings: {
            title: 'Settings',
            language: 'Language',
            categories: {
                title: 'Categories',
                description: 'Manage categories & field layouts.',
                new: 'New Category',
                edit: 'Edit Category',
                namePlaceholder: 'Category Name',
                saveConfig: 'Save Configuration',
            },
            fields: {
                title: 'Log Fields',
                description: 'Select which fields are visible for this category.',
                active: 'Active Fields (Ordered)',
                available: 'Available Fields',
                newCustom: 'New Custom Field',
                addCustom: 'Custom Field',
                label: 'Label',
                type: 'Data Type',
                placeholder: 'e.g. Distance (km)',
                create: 'Create Field',
                noActive: 'No active fields. Add from below.',
            },
            appearance: {
                color: 'Color',
                nameAndIcon: 'Name & Icon',
            },
            confirmDelete: {
                title: 'Delete {type}?',
                category: 'Category',
                field: 'Field',
            }
        },
        stats: {
            title: 'Statistics',
            periods: {
                week: 'Week',
                month: 'Month',
                year: 'Year',
            },
            metrics: {
                amount: 'Amount ($)',
                count: 'Count',
            },
            categories: {
                all: 'All Categories',
            },
            kpi: {
                entries: 'Entries',
                balance: 'Net Balance',
            },
            charts: {
                trendFinancial: 'Financial Trend',
                trendActivity: 'Activity Trend',
                distribution: 'Category Distribution',
                noData: 'No data for this period',
            },
            views: {
                amount: 'Amount ($)',
                count: 'Frequency (Count)',
            },
            filter: {
                all: 'All Categories',
            },
            kpis: {
                entries: 'Entries',
                netBalance: 'Net Balance',
            }
        },
        search: {
            title: 'Search',
            placeholder: 'Search logs, memos, or categories...',
            results: 'Found {count} results',
            noResults: 'No results found for "{query}"',
            startTyping: 'Start typing to search through your life logs...',
        },
        fields: {
            time: 'Time',
            amount: 'Amount',
            memo: 'Memo',
            image_url: 'Image',
            share: 'Share',
            system: 'SYSTEM',
            title: 'Title',
            titlePlaceholder: 'e.g. Shopping at Costco',
            date: 'Date',
            pickDate: 'Pick a date',
            category: 'Category',
            selectCategory: 'Select category',
            memoPlaceholder: 'Additional details...',
        },
        common: {
            default: 'Default',
            today: 'Today',
            loading: 'Loading...',
            share: 'Share',
            locale: 'en-US',
            currency: 'USD',
        }
    },
    ko: {
        nav: {
            calendar: '달력',
            stats: '통계',
            add: '추가',
            search: '검색',
            settings: '설정',
        },
        actions: {
            save: '저장',
            cancel: '취소',
            delete: '삭제',
            edit: '수정',
            create: '생성',
            add: '추가',
            close: '닫기',
            back: '이전',
            saving: '저장 중...',
            deleting: '삭제 중...',
            confirmDelete: '이 로그를 삭제하시겠습니까?',
            fillRequired: '제목을 입력하고 카테고리를 선택해주세요.',
            newLog: '새 로그',
            editLog: '로그 수정',
            saveLog: '로그 저장',
            updateLog: '로그 업데이트',
        },
        settings: {
            title: '설정',
            language: '언어',
            categories: {
                title: '카테고리',
                description: '카테고리 및 필드 레이아웃을 관리합니다.',
                new: '새 카테고리',
                edit: '카테고리 수정',
                namePlaceholder: '카테고리 이름',
                saveConfig: '구성 저장',
            },
            fields: {
                title: '로그 필드',
                description: '이 카테고리의 로그에 표시할 필드를 선택하세요.',
                active: '활성 필드 (순서대로)',
                available: '사용 가능한 필드',
                newCustom: '새 커스텀 필드',
                addCustom: '커스텀 필드',
                label: '라벨',
                type: '데이터 타입',
                placeholder: '예: 거리 (km)',
                create: '필드 생성',
                noActive: '활성 필드가 없습니다. 아래에서 추가하세요.',
            },
            appearance: {
                color: '색상',
                nameAndIcon: '이름 및 아이콘',
            },
            confirmDelete: {
                title: '{type}를 삭제하시겠습니까?',
                category: '카테고리',
                field: '필드',
            }
        },
        stats: {
            title: '통계',
            periods: {
                week: '주간',
                month: '월간',
                year: '년간',
            },
            metrics: {
                amount: '금액',
                count: '횟수',
            },
            categories: {
                all: '모든 카테고리',
            },
            kpi: {
                entries: '총 항목',
                balance: '순 합계',
            },
            charts: {
                trendFinancial: '금액 추이',
                trendActivity: '활동 추이',
                distribution: '카테고리 분포',
                noData: '이 기간의 데이터가 없습니다.',
            },
            views: {
                amount: '금액',
                count: '횟수',
            },
            filter: {
                all: '모든 카테고리',
            },
            kpis: {
                entries: '항목 수',
                netBalance: '순 합계',
            }
        },
        search: {
            title: '검색',
            placeholder: '로그, 메모 또는 카테고리 검색...',
            results: '{count}개의 결과가 있습니다.',
            noResults: '"{query}"에 대한 결과가 없습니다.',
            startTyping: '검색어를 입력하여 로그를 찾아보세요...',
        },
        fields: {
            time: '시간',
            amount: '금액',
            memo: '메모',
            image_url: '이미지',
            share: '공유',
            system: '시스템',
            title: '제목',
            titlePlaceholder: '예: 코스트코 장보기',
            date: '날짜',
            pickDate: '날짜 선택',
            category: '카테고리',
            selectCategory: '카테고리 선택',
            memoPlaceholder: '상세 내용...',
        },
        common: {
            default: '기본값',
            today: '오늘',
            loading: '로딩 중...',
            share: '공유',
            locale: 'ko-KR',
            currency: 'KRW',
        }
    }
};
