import React, { useState, useEffect, useRef } from "react";
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Event } from '../tracking/';
import { Button, Rate, Menu, Dropdown, notification, DatePicker } from 'antd';
import axios from 'axios';
import HeartOutlined from '@ant-design/icons/HeartOutlined';
import HeartFilled from '@ant-design/icons/HeartFilled';
import DownOutlined from '@ant-design/icons/DownOutlined';

import {
	fetchUsersBooks,
	fetchUsersShelves,
	getGoogleResults
} from '../../actions/index';

import BookIcon from '../common/BookIcon';
import styled from 'styled-components';

import { updateBookItem } from '../helpers';

const apiURL = 'https://www.googleapis.com/books/v1/volumes?q=';
const apiLocal = process.env.APIURL || 'http://localhost:5000/api';

const BookContainer = styled.div`
    width: 90%;
    margin: ${props => props.source === 'search' ? '0 auto' : '8px auto'};
    display: flex;
    // justify-content: space-between;

    border-bottom: ${props => props.source === 'search' ? '1px solid #cecece' : ''};
    border: ${props => props.source === 'library' ? '1px solid #cecece' : ''};
    border-radius: ${props => props.source === 'library' ? '4px' : ''};
    
    padding: ${props => props.source === 'search' ? '16px 0' : ''};
    

    font-family: 'Open Sans', sans-serif;

    .betterReadsOrange {background: #D24719;}
    .betterReadsGreen{background-color: #547862;}

    .fs-13{font-size: 13px;}
    .fs-14{font-size: 14px;}
    .fs-16{font-size: 16px;}

    .fw-600{font-weight: 600;}
    .fw-bold{font-wieght: bold;} 

    .lh-20{line-height: 20px;}
    .lh-22{line-height: 22px;}



    .thumbContainer{
        .thumbnail{
            border-radius: 5px 0 0;
            height: 112px;
            width: 82px;
            background-image: url(${props => props.bgImage});
            background-size: cover;
        }
        .ant-btn {
            color: #F7F7F7;
            width: 82px;
            border: none;
            border-radius: 0 0 0 5px;
            font-size: 13px;
            font-weight: 600;
            line-height: 20px;
            padding: 0 3px;
    
            .anticon-down{
                margin-left: 2px;
            }

            svg {
                margin-right: 4px;
            }
        }
    }

    .book{
        display: flex;
        flex-direction: column;
        width: 100%;
        justify-content: space-between;
        padding: 12px 8px;

        .bookDetail{
            display: flex;
            flex-direction: row;
            justify-content: space-between;

            .titleAuthor {

                .title {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;  
                    overflow: hidden;
                }
            }

            .bookFav{
                .anticon-heart svg{
                    height: 26px;
                    width: 29px;
                    color: #D24719;
                }
            }
        }

        .calendars {
            display: flex;

            .input{
                display: flex;
                flex-direction: column;
                max-width: 100px;
                width: 50%;

                .dateLabel {
                    margin-bottom: 0;
                    font-family: Open Sans;
                    font-weight: bold;
                    font-size: 0.625rem;
                }
            }

            .input:first-child {
                border-right: 1px solid #bfbfbf;
            }

            .input:last-child {
                padding-right: 0;
                padding-left: 8px;
            }

            .ant-calendar-picker-input {
                height: 16px;
                padding: 0;
                background-color: #fff;
                border: none;
            }
        }
        
    }

    @media (min-width: 1120px) {
        width: ${props => props.conWidth} || '336px';
        // margin: 8px 0 8px 0;

        .and-calendar-picker-input{
            
        }
    }
`;

const BookItem = props => {
    // const { id, selfLink, volumeInfo, accessInfo, searchInfo, saleInfo } = props.book;
    const { googleId } = props.book;
    const [inLibrary, setInLibrary] = useState(props.userBooks.filter(b => b.googleId === googleId).length ? true : false)
    const [favorite, setFavorite] = useState(props.userBooks.filter(b => b.googleId === googleId && b.favorite).length ? true : false);
    const [readrrId, setReadrrId] = useState(props.userBooks.filter(b => b.googleId === googleId).length ? props.userBooks.find(b => b.googleId === googleId).userBooksId : null);
    const [readingStatus, setReadingStatus] = useState(props.userBooks.filter(b => b.googleId === googleId).length ? props.userBooks.find(b => b.googleId === googleId).readingStatus : null);
    const [trackBtnLabel, setTrackBtnLabel] = useState('Track this');
    
    let actionType = null;
    
    const readingStatusRef = useRef(readingStatus);
    const favoriteRef = useRef(favorite);
    const firstRun = useRef(true);
    useEffect(() => {
        if(firstRun.current){
            firstRun.current = false;
            return;
        }
        // Run if reading status changes
        if(readingStatusRef.current !== readingStatus){
            actionType = 'readingStatus';
            readingStatusRef.current = readingStatus;
        }
        
        // Run if favorite status changes
        if(favoriteRef.current !== favorite){
            actionType = 'favorite';
            favoriteRef.current = favorite;
        }

        updateBookItem(localStorage.getItem('id'), readrrId, inLibrary, props.book, actionType, favorite, readingStatus);
    }, [favorite, readingStatus]);

    useEffect(() => {
        if(readingStatus === 1){
            setTrackBtnLabel('To read');
        }else if(readingStatus === 2){
            setTrackBtnLabel('In progress');
        }else if(readingStatus === 3){
            setTrackBtnLabel('Finised');
        }else{
            setTrackBtnLabel('Track this');
        }
    }, [])
    

    const readingStatusUpdate = key => {
        setReadingStatus(key.item.props.value);
        setTrackBtnLabel(key.item.props.children);
    }

    const TrackMenu = (
        <Menu onClick={key => readingStatusUpdate(key)}>
            <Menu.Item key="1" value="1">To read</Menu.Item>
            <Menu.Item key="2" value="2">In Progress</Menu.Item>
            <Menu.Item key="3" value="3">Finished</Menu.Item>
        </Menu>
    )

	return (
		<BookContainer conWidth="100%" conHeight="143px" bgImage={props.book.smallThumbnail} source={props.source}  data-library={inLibrary}>
			<div className="thumbContainer">
                <Link to={`/Book/${googleId}`} onClick={() => Event('Book', 'User clicked for book details', 'SEARCH_RESULTS')}>
				    <div className="thumbnail"></div>
                </Link>
				<Dropdown overlay={TrackMenu} trigger={['click']}>
                    <Button className={(trackBtnLabel === 'Track this' ? 'betterReadsOrange' : 'betterReadsGreen')}>{trackBtnLabel} <DownOutlined /></Button>
                </Dropdown>
			</div>
			<div className="book">
				<div className="bookDetail">
					<div className="titleAuthor">
                        <div className="title fs-16 fw-600">{props.book.title}</div>
                        <div className="author fs-16">
                            {
                                props.book.authors &&
                                props.book.authors
                            }
                        </div>
                    </div>
					<div className="bookFav">
                        {   favorite
                            ? <HeartFilled onClick={() => setFavorite(!favorite)} /> 
                            : <HeartOutlined onClick={() => setFavorite(!favorite)} />
                        }
                    </div>
				</div>
				{
                    props.source === 'library' &&
                    <div className="calendars">
                        <div className="input">
                            <div className='dateLabel'>DATE STARTED</div>
                            <DatePicker placeholder='Started' />
                        </div>

                        <div className="input">
                            <div className='dateLabel'>DATE STARTED</div>
                            <DatePicker placeholder='Ended' />
                        </div>
                    </div>
				}
				{
					props.source === 'search' &&
					<Rate allowHalf defaultValue={props.book.averageRating} />
				}
			</div>
		</BookContainer>
	)
}

const mapStateToProps = state => {
	return {
		userBooks: state.library.userBooks,
		userShelves: state.library.userShelves
	};
};

export default connect(mapStateToProps, {
	fetchUsersBooks,
	fetchUsersShelves,
	getGoogleResults
})(BookItem);

// export default BookItem;