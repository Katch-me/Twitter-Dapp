// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;


contract Twit_contractor{

    struct Twit{
        uint id;
        string content;
        address author;
        uint createdAt; //timestamp ( when it was created)
    }

    struct Message{
        uint id ;
        string content;
        address from;
        address to ;
        uint createdaAt;
    }

    mapping(uint=>Twit) public twits; //mapping to get twit 
    mapping(address=>uint[]) public twitsOf; //for getting the id of twits
    mapping(address=>Message[]) public conversation; //for getting the message
    mapping(address=>mapping(address=>bool)) public operators; //this for giving access for the account 
    mapping(address=>address[]) public following; //getting who do we follow

    uint nextId;
    uint nextMessageId;

    function _twit(address _from, string memory _content) public{ //who has ine the twit , and wht twit it is 
        twits[nextId]=Twit(nextId,_content,_from,block.timestamp);
        twitsOf[_from].push(nextId); //storing the Id of tweets in twitsOf variable 
        nextId=nextId+1; //so that next if twits id gets +1 

    }

    function _sendMessage(address _from,address _to,string memory _content) public {
        conversation[_from].push(Message(nextMessageId,_content,_from,_to,block.timestamp));
        nextMessageId++;

    }

    function twit(string memory _content) public{ //called by owner
        _twit(msg.sender,_content);
    }

    function twit(address _from,string memory _content) public{ //if u have given access to anyone by owner
        _twit(_from,_content);

    }
 
   //polymorphism : two function with same name sendMessage are there , but the parameters / arguments are different or there datatype is different then onlysolidity will validate it 
    function sendMessage(string memory _content, address _to) public{
        _sendMessage(msg.sender,_to,_content);

    }

    function sendMessage(address _from, address _to, string memory _content) public{
        _sendMessage(_from, _to, _content);

    }

    function _follow(address _followed) public{
        following[msg.sender].push(_followed);

    }

    function allow(address _operator) public { //access allow karna hai
        operators[msg.sender][_operator]=true;
    }

    function disallow(address _operator) public { // access allow nahi karna 
        operators[msg.sender][_operator]=false;
    }

    function getLatestTwits(uint count) view  public returns(Twit[] memory ){
        require(count>0 && count<=nextId, "Count is not proper");
        Twit[] memory _twits = new Twit[](count); //array length = count 

        uint j;

        for(uint i=nextId-count; i<nextId; i++){
            Twit storage _structure = twits[i];
            _twits[j]=Twit(
            _structure.id, 
            _structure.content,
            _structure.author, 
            _structure.createdAt
            );
            j=j+1;
        }

        return _twits;

    }

//mapping me se direct return nahi karsate so did setup for function

     function getLatestOfUser(address _user,uint count) public view returns(Twit[] memory){//to fetch the information of "kisibhi user ne twit kiya hoto" , count variable to seeing how many twits u wanna see
        Twit[] memory _twits= new Twit[](count);//
        // twitsOf[_user] is having all the user id's 

        uint[] memory ids = twitsOf[_user]; //ids ia an array 
        
      
        require(count>0 && count<nextId,"Count is not defined");
        
        uint j;
        for(uint i=ids.length-count; i<nextId; i++){
            Twit storage _structure = twits[ids[i]];
            _twits[j]=Twit(
            _structure.id, 
            _structure.content,
            _structure.author, 
            _structure.createdAt
            );

            j=j+1;
        }
        return _twits;
     } 

     function getNextId() public view returns(uint) {
    return nextId;
}



}