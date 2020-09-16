import React from "react";
import ReactDOM from "react-dom";

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      pages: null,
      currentPage: null,
      searchValue: '',
      sortedBy: null,
      reverse: null,
      global: null,
      pageArray: [],
      currentArray: [],
      dataArray : [],
      currentItem: null,
      showDetailView: false,
      showForm: false,
      formData: {
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: {
          streetAddress: '',
          city: '',
          state: '',
          zip: ''
        }
      },
    }
  }
  
  // toggling between data array parts(pages)
  togglePage(e) {
    const currentPage = e.target.value;
    const pageArray = this.state.currentArray.slice((currentPage-1) * 20, ((currentPage-1) * 20) + 20);
    
    this.setState({pageArray, currentPage});
  }
  
  // global sort(all array) and local sort(only current page) according function argument
  sortDataArray(isGlobal, e) {
    const sortType = e.target.className.split(' ')[0];
    let sortArray;
    
    //choose array to sort
    if(isGlobal) {
      e.preventDefault();
      sortArray = this.state.currentArray;
    }
    
    else {
      sortArray = this.state.pageArray;
    }
    
    // array has sorted previously - only reversing and setting state
    if(sortType === this.state.sortedBy) {
      sortArray.reverse();
      
      if(isGlobal) {
        this.setState({currentPage: 1, reverse: !this.state.reverse, global: isGlobal, currentArray: sortArray, pageArray: sortArray.slice(0, 20)});
      }
      
      else {
        this.setState({reverse: !this.state.reverse, global: isGlobal, pageArray: sortArray});
      }
    }
    
    //sorting chosen array
    else {
      sortArray.sort((a, b) => {
        if(a[sortType] > b[sortType]) {
          return 1;
        }
        if(a[sortType] < b[sortType]) {
          return -1;
        }
        return 0;
      });
      
      // setting state
      if(isGlobal) {
        this.setState({currentPage: 1, sortedBy: sortType, reverse: false, global: isGlobal, currentArray: sortArray, pageArray: sortArray.slice(0, 20)});
      }
      
      else {
        this.setState({sortedBy: sortType, reverse: false, global: isGlobal, pageArray: sortArray});
      }
    }
  }
  
  // changing value of input field
  changeSearchValue(e) {
    this.setState({searchValue: e.target.value});
  }
  
  // filtering data array
  filterDataArray() {
    // converting input value to lower case
    const input = this.state.searchValue.toLowerCase();
    // create new array which contains input value into any of it's properties
    const currentArray = this.state.dataArray.filter(el => String(el.id).indexOf(input) !== -1 || el.firstName.toLowerCase().indexOf(input) !== -1 || el.lastName.toLowerCase().indexOf(input) !== -1 || el.email.toLowerCase().indexOf(input) !== -1 || el.phone.toLowerCase().indexOf(input) !== -1);
    
    // setting state
    this.setState({pages: Math.ceil(currentArray.length / 20), currentPage: 1, sortedBy: null, reverse: false, global: null, currentArray, pageArray: currentArray.slice(0, 20), currentItem: null, showDetailView: false});
  }
  
  // open detail view of data array's item which has been clicked by user
  showDetailView(e) {
    const currentItem = e.currentTarget.value;
    this.setState({currentItem, showDetailView: true});
  }
  
  // open form for adding new item into data array
  showForm() {
    this.setState({showForm: true});
  }
  
  // changing value of some form field depends on event target into fuction argument
  changeFormValue(e) {
    const inputType = e.target.parentNode.className.split(' ')[0];
    let formObj = this.state.formData;
    
    formObj[inputType] = e.target.value;
    this.setState({formObj});
  }
  
  // adding new item into data array
  updateArray(e) {
    e.preventDefault();
    let newDataArray = this.state.dataArray;
    const formObj = this.state.formData;
    
    newDataArray = [formObj, ...newDataArray];
    this.setState({sortedBy: null, reverse: null, global: null, pages: Math.ceil(newDataArray.length / 20), currentPage: 1, dataArray: newDataArray, currentArray: newDataArray, pageArray: newDataArray.slice(0, 20), showForm: false, formData: {id: '', firstName: '', lastName: '', email: '', phone: '', address: {streetAddress: '', city: '', state: '', zip: ''}}});
  }
  
  // get data from JSON and initialize primary state 
  componentWillMount() {
    fetch('https://raw.githubusercontent.com/Eugen-der-edle-Ritter/data_storage/master/userData.json')
      .then(response => response.json())
      .then(result => {
      const pages = Math.ceil(result.length / 20);
      this.setState({pages, currentPage: 1, dataArray: result, currentArray: result, pageArray: result.slice(0, 20)});
    });
  }
  
  render() {
    // creating list items and putting into variable for rendering further
    const listItems = this.state.pageArray.map((el, ind) => {
      return (
        <li value={ind} key={ind} className="listItem" onClick={this.showDetailView.bind(this)}>
          <div className="id">{el.id}</div>
          <div className="firstName">{el.firstName}</div>
          <div className="lastName">{el.lastName}</div>
          <div className="email">{el.email}</div>
          <div className="phone">{el.phone}</div>
        </li>
      );
    });
    
    // creating title list item;
    const titleArray = ['id', 'firstName', 'lastName', 'email', 'phone'];
    const titleItem = titleArray.map((el, ind) => {
      return (
        <div key={ind} className={el + ' title'}>
          {el}
          <div className={el === this.state.sortedBy ? this.state.reverse ? 'desc' : 'asc' : 'unorder'} />
        </div>
      );
    });
    
    // wrapping title list item and list items together into variable
    const dataList = (
      <ul className="list">
          <li className="listItem" title="right click for global sort" onClick={this.sortDataArray.bind(this, false)} onContextMenu={this.sortDataArray.bind(this, true)}>
            {titleItem}
          </li>
          {listItems}
        </ul>
    );
    
    // creating pagination list
    let pageList = [];
    
    if (this.state.currentPage <= 3) {
      for(let i = 1; i <= 5 && i <= this.state.pages; i++) {
        if(i === this.state.currentPage) {
          pageList.push(<li key={i} value={i} className="active">{i}</li>);
        }
        else {
          pageList.push(<li key={i} value={i} onClick={this.togglePage.bind(this)}>{i}</li>);
        }
        if(i === 5) {
          pageList.push(<li key={0} value={this.state.currentPage + 1} onClick={this.togglePage.bind(this)}>Дальше</li>);
        }
      }
    }
    
    else {
      for(let i = this.state.currentPage - 2; i <= this.state.currentPage + 2 && i <= this.state.pages; i++) {
        if(i === this.state.currentPage - 2) {
          pageList.push(<li key={1} value={1} onClick={this.togglePage.bind(this)}>В начало</li>);
        }
        if(i === this.state.currentPage) {
          pageList.push(<li key={i} value={i} className="active">{i}</li>);
        }
        else {
          pageList.push(<li key={i} value={i} onClick={this.togglePage.bind(this)}>{i}</li>);
        }
        if(i === this.state.currentPage + 2) {
          pageList.push(<li key={0} value={this.state.currentPage + 1} onClick={this.togglePage.bind(this)}>Дальше</li>);
        }
      }
    }
    
    //creating detail view block for observing full information about chisen item
    let detailView = '';
    if(this.state.showDetailView) {
      const currentItem = this.state.currentArray[this.state.currentItem];
      detailView = (
        <div className="detailView">
          Выбран пользователь <b>{currentItem.firstName + ' ' + currentItem.lastName}</b>
          <br />
          Описание:
          <br />
          <textarea value={currentItem.description} disabled />
          <br />
          Адрес проживания: <b>{currentItem.address.streetAddress}</b>
          <br />
          Город: <b>{currentItem.address.city}</b>
          <br />
          Провинция/штат: <b>{currentItem.address.state}</b>
          <br />
          Индекс: <b>{currentItem.address.zip}</b>
        </div>
      );
    }
    
    // creating form for adding new items into data array
    let addForm = '';
    const formObj = this.state.formData;
    let addButton = <button type="submit" className="addBtn" title="fill in all fields" disabled>Добавить в таблицу</button>;
    
    // making button enable if all fields were filled
    if(formObj.id && formObj.firstName && formObj.lastName && formObj.email && formObj.phone) {
      addButton = <button type="submit" className="addBtn" onClick={this.updateArray.bind(this)}>Добавить в таблицу</button>;
    }
    
    // creating html form if user click button
    if(this.state.showForm) {
      addForm = (
        <form className="addForm">
          <div className="id formItem">
            id
            <input value={this.state.formData.id} onChange={this.changeFormValue.bind(this)} />
          </div>
          <div className="firstName formItem">
            Имя
            <input value={this.state.formData.firstName} onChange={this.changeFormValue.bind(this)} />
          </div>
          <div className="lastName formItem">
            Фамилия
            <input value={this.state.formData.lastName} onChange={this.changeFormValue.bind(this)} />
          </div>
          <div className="email formItem">
            e-mail
            <input value={this.state.formData.email} onChange={this.changeFormValue.bind(this)} />
          </div>
          <div className="phone formItem">
            Телефон
            <input value={this.state.formData.phone} onChange={this.changeFormValue.bind(this)} />
          </div>
          {addButton}
        </form>
      );
    }
    
    // picking up all together and returning html
    return (
      <div className="wrapper">
        <h2>TABLE</h2>
        <div className="conrtolPanel">
          <input value={this.state.searchValue} className="inputArea" onChange={this.changeSearchValue.bind(this)} />
          <button onClick={this.filterDataArray.bind(this)}>
            Найти
          </button>
          <br />
          <button onClick={this.showForm.bind(this)}>
            Добавить
          </button>
        </div>
        {addForm}
        <ul className="pageList">
          {pageList}
        </ul>
        {dataList}
        {detailView}
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);