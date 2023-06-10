1. **creatorOnly**

    *_ambassador == address(0) && _project == address(0)*

2. **ambassadorWithNoProject**

*_ambassador != address(0) && _project == address(0)
   && _ambShare != 0 && _ambShare < 21*

3. **projectWithNoAmbassador**
   
*_project != address(0) && _ambassador == address(0)
   && _projectShare != 0 && _projectShare < 91*

4. **Both Ambassador and Project**
   
*_ambassador != address(0) && _project != address(0)
    && _ambShare != 0 && _ambShare < 21
    && _projectShare != 0 && _projectShare < 71*

Ideally this is Push. Please educate us on the push vs withdraw function. What is the best practice for security and safety? We also need to consider if a user paying additional gas fees to withdraw is ethical, as far as my understanding is other platforms have an automatic (push) payment.


**Primary Sale: First Sale After Creator Mints (10% Royalties)**
90% split between creator/ambassador/project

|Owner|Up to 80%|
| :- | :- |
|Creator|Up to 10%|
|Project Support|Up to 100% of Creator Share|
|Ambassador|Up to 20% of Creator Share before Project share |
|MAD Fee|10%|

**Lazy Mint Sale ( buyer pays the mint)**

|Owner|Up to 80%|
| :- | :- |
|Creator|Up to 10%|
|Project Support|Up to 100% of Creator Share|
|Ambassador|Up to 20% of Creator Share|
|MAD Fee|10%|


**Marketplace: Resale (everytime after first sale)**

|<p>Creator Royalties.</p><p>*Project royalties are configurable and are independent from project commission on initial sale.*</p><p>*Ambassador is set at a percentage chosen on the creator account set up.* </p><p>*Creator is set at collection set up.* </p>|<p>Up to 10%</p><p></p>|
| :- | :- |

|Ambassador|Up to 20% before project share|
| :- | :- |
|Project|Up to 100% of remaining creator share|

|||
| :- | :- |
|Owner|87\.5%|
|Platform Fee|2\.5%|

Resale Example:

$1,000

|Creator Royalties|<p>Up to 10%</p><p></p>||
| :- | :- | :- |

|Ambassador|20% of Creator|
| :- | :- |
|Project|10% of Remaining Creator|
|Creator|70% - remaining amount|

|||<p>$100~</p><p></p>|
| :- | :- | :- |

|Ambassador|$20|
| :- | :- |
|Project|$8|
|Creator|$72|

||||
| :- | :- | :- |
|Owner|87\.5%|$875|
|Platform Fee|2\.5%|$25|


|creator royalties |<p>5%</p><p></p>||
| :- | :- | :- |

|Ambassador|0%|
| :- | :- |
|Project|90%|
|Creator|10% - remaining amount |

|||<p>$50</p><p></p>|
| :- | :- | :- |

|Ambassador|0|
| :- | :- |
|project |$45|
|creator|$5|

||||
| :- | :- | :- |
|owner|92\.5%|$925|
|platform fee|2\.5%|$25|

